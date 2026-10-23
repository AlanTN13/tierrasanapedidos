import { formatCartMoney, NOVEMBER_PROMOTION, quoteCart, toCents, type Promotion } from "./promotions.ts";
import type { CartItem } from "@/types/catalog";

const WHATSAPP_NUMBER = "5491164453032";

export function createWhatsAppUrl(items: CartItem[], subtotal: number, code: string | null = null,
  now = Date.now(), promotion: Promotion = NOVEMBER_PROMOTION) {
  // Recalculate at the click boundary. Never trust a stale UI discount or passed subtotal.
  void subtotal; // Retains compatibility with existing callers.
  const quote = quoteCart(items.reduce((sum, item) => sum + toCents(item.presentation.precio) * item.quantity, 0), code, now, promotion);
  const lines = items.map(
    ({ product, presentation, quantity }) =>
      `- ${quantity} x ${product.nombre} ${presentation.etiqueta} — ${formatCartMoney(
        toCents(presentation.precio) * quantity,
      )}`,
  );

  const message = [
    "Hola Tierra Sana! 🌱 Quiero hacer este pedido:",
    "",
    ...lines,
    "",
    ...(quote.status === "applied" ? [
      `Subtotal: ${formatCartMoney(quote.subtotalCents)}`,
      `Cupón: ${quote.code}`,
      `Descuento ${quote.percent}%: -${formatCartMoney(quote.discountCents)}`,
      `*Total estimado con descuento: ${formatCartMoney(quote.totalCents)}*`,
    ] : [`Total estimado: ${formatCartMoney(quote.totalCents)}`]),
    "",
    "Mi nombre:",
    "Zona de entrega/retiro:",
    "Entrega o retiro a coordinar. Envío no incluido en el total estimado.",
    "La compra, los precios y el stock se confirman por WhatsApp.",
    "",
    "Gracias!",
  ].join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
