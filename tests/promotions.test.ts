import assert from "node:assert/strict";
import test from "node:test";
import { NOVEMBER_PROMOTION, quoteCart, toCents, promotionStatus, pesosToExceedMinimum, formatCartMoney } from "../lib/promotions.ts";
import { createWhatsAppUrl } from "../lib/whatsapp.ts";
import type { CartItem } from "../types/catalog.ts";

const approved = { ...NOVEMBER_PROMOTION, commercialApproved: true };
const november = Date.parse("2026-11-15T12:00:00-03:00");
const code = approved.code;
function items(price: number, quantity = 1): CartItem[] {
  const presentation = { etiqueta: "unidad", precio: price, measurementKind: "unit" as const, amountValue: 1, amountUnit: "unit" as const, amountInBaseUnits: 1 };
  return [{ product: { id: "test", nombre: "Producto", categoria: "Test", descripcion: "", imagen: "", destacado: false, presentaciones: [presentation] }, presentation, quantity }];
}

for (const [subtotal, discount] of [[19000, 0], [20000, 0], [20001, 2000.1], [25000, 2500], [40000, 3000]]) {
  test(`carrito $${subtotal}: descuento $${discount}`, () => {
    const result = quoteCart(toCents(subtotal), code, november, approved);
    assert.equal(result.discountCents, toCents(discount));
    assert.equal(result.totalCents, toCents(subtotal) - toCents(discount));
    assert.equal(result.status, discount ? "applied" : "minimum");
  });
}
test("centavos exactos, umbral estricto y tope configurable", () => {
  assert.equal(quoteCart(2_000_001, code, november, approved).status, "applied");
  assert.equal(quoteCart(4_000_000, code, november, { ...approved, maximumDiscountCents: null }).discountCents, 400_000);
  assert.equal(quoteCart(4_000_000, code, november, { ...approved, maximumDiscountCents: 100_000 }).discountCents, 100_000);
  assert.match(formatCartMoney(200010), /2\.000,10/);
  assert.equal(toCents(0.1 + 0.2), 30);
});
test("normaliza código, rechaza desconocido y no duplica ni vuelve negativo el descuento", () => {
  assert.equal(quoteCart(2500000, " noviembre10 ", november, approved).discountCents, 250000);
  assert.equal(quoteCart(2500000, "otro", november, approved).status, "unknown");
  assert.equal(quoteCart(0, code, november, approved).totalCents, 0);
  assert.equal(quoteCart(-100, code, november, approved).totalCents, 0);
  assert.equal(quoteCart(Number.NaN, code, november, approved).totalCents, 0);
  assert.deepEqual(quoteCart(2500000, code, november, approved), quoteCart(2500000, code, november, approved));
});
test("inicio y fin exactos en Argentina, independiente de la zona del proceso", () => {
  const start = Date.parse("2026-11-01T03:00:00Z");
  const end = Date.parse("2026-12-01T03:00:00Z");
  assert.equal(promotionStatus(approved, start - 1), "upcoming");
  assert.equal(promotionStatus(approved, start), "applied");
  assert.equal(promotionStatus(approved, end - 1), "applied");
  assert.equal(promotionStatus(approved, end), "expired");
  assert.equal(quoteCart(2500000, code, end, approved).discountCents, 0);
});
test("gate económico sigue bloqueando en noviembre y sin cupón no hay descuento", () => {
  assert.equal(quoteCart(2500000, code, november).status, "disabled");
  assert.equal(quoteCart(2500000, code, november).discountCents, 0);
  assert.equal(quoteCart(2500000, null, november, approved).totalCents, 2500000);
});
test("incentivo exige superar el umbral", () => {
  assert.equal(pesosToExceedMinimum(1450000, approved), 5501);
  assert.equal(pesosToExceedMinimum(2000000, approved), 1);
  assert.equal(pesosToExceedMinimum(2000100, approved), 0);
});
test("quitar productos recalcula sin conservar un descuento anterior", () => {
  assert.equal(quoteCart(4000000, code, november, approved).discountCents, 300000);
  assert.equal(quoteCart(2500000, code, november, approved).discountCents, 250000);
  assert.equal(quoteCart(1900000, code, november, approved).discountCents, 0);
});
test("WhatsApp conserva productos, subtotal, cupón, descuento y total de la cotización", () => {
  for (const price of [19000, 20000, 20001, 25000, 40000]) {
    const quote = quoteCart(toCents(price), code, november, approved);
    const url = new URL(createWhatsAppUrl(items(price), 999, code, november, approved));
    const message = url.searchParams.get("text")!;
    assert.equal(url.hostname, "wa.me");
    assert.ok(message.includes(formatCartMoney(quote.totalCents)));
    assert.match(message, /1 x Producto unidad/);
    assert.match(message, /compra, los precios y el stock se confirman por WhatsApp/);
    assert.match(message, /Envío no incluido/);
    if (quote.discountCents) {
      assert.ok(message.includes(`Subtotal: ${formatCartMoney(quote.subtotalCents)}`));
      assert.ok(message.includes(`Cupón: ${code}`));
      assert.ok(message.includes(`Descuento 10%: -${formatCartMoney(quote.discountCents)}`));
    } else assert.ok(!message.includes("Cupón:"));
  }
});
test("WhatsApp revalida vencimiento y gate al click; sin cupón mantiene total original", () => {
  for (const [now, promo, coupon] of [[Date.parse(approved.endsAt), approved, code], [november, NOVEMBER_PROMOTION, code], [november, approved, null]] as const) {
    const text = new URL(createWhatsAppUrl(items(12500, 2), 25000, coupon, now, promo)).searchParams.get("text")!;
    assert.ok(!text.includes("Cupón:"));
    assert.ok(text.includes(formatCartMoney(2500000)));
  }
});
