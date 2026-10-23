export type Promotion = {
  code: string;
  percent: number;
  minimumCents: number;
  maximumDiscountCents: number | null;
  startsAt: string;
  endsAt: string;
  commercialApproved: boolean;
};

// Midnight in America/Argentina/Buenos_Aires (UTC-03:00).
// Approval must remain false until current basket costs/margins are validated.
export const NOVEMBER_PROMOTION: Promotion = {
  code: "NOVIEMBRE10",
  percent: 10,
  minimumCents: 2_000_000,
  maximumDiscountCents: 300_000,
  startsAt: "2026-11-01T00:00:00-03:00",
  endsAt: "2026-12-01T00:00:00-03:00",
  commercialApproved: false,
};

export type CouponStatus = "none" | "unknown" | "upcoming" | "expired" | "disabled" | "minimum" | "applied";
export type CartQuote = {
  status: CouponStatus;
  code: string | null;
  percent: number;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
};

export function toCents(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.round(value * 100)) : 0;
}

export function normalizeCoupon(code: string) {
  return code.trim().toUpperCase();
}

export function promotionStatus(promotion: Promotion, now: number): CouponStatus {
  if (!Number.isFinite(now) || now < Date.parse(promotion.startsAt)) return "upcoming";
  if (now >= Date.parse(promotion.endsAt)) return "expired";
  if (!promotion.commercialApproved) return "disabled";
  return "applied";
}

export function quoteCart(
  subtotalCents: number,
  code: string | null,
  now: number = Date.now(),
  promotion: Promotion = NOVEMBER_PROMOTION,
): CartQuote {
  const subtotal = Number.isSafeInteger(subtotalCents) ? Math.max(0, subtotalCents) : 0;
  const normalized = normalizeCoupon(code ?? "");
  let status: CouponStatus = "none";
  if (normalized) {
    status = normalized === promotion.code ? promotionStatus(promotion, now) : "unknown";
    if (status === "applied" && subtotal <= promotion.minimumCents) status = "minimum";
  }
  const discount = status === "applied"
    ? Math.min(subtotal, promotion.maximumDiscountCents ?? subtotal, Math.max(0, Math.round(subtotal * promotion.percent / 100)))
    : 0;
  return {
    status, code: normalized || null, percent: status === "applied" ? promotion.percent : 0,
    subtotalCents: subtotal, discountCents: discount, totalCents: subtotal - discount,
  };
}

export function formatCartMoney(cents: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency", currency: "ARS",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function couponMessage(status: CouponStatus, promotion: Promotion) {
  switch (status) {
    case "unknown": return "Ese cupón no existe. Revisá el código e intentá de nuevo.";
    case "upcoming": return "Este cupón estará vigente del 1 al 30 de noviembre de 2026.";
    case "expired": return "Este cupón venció el 30 de noviembre de 2026.";
    case "disabled": return "Esta promoción todavía no está habilitada.";
    case "minimum": return `El cupón está guardado. Para usarlo, tu compra debe superar ${formatCartMoney(promotion.minimumCents)} antes del descuento.`;
    case "applied": return "¡Cupón aplicado!";
    default: return "";
  }
}

export function promotionConditions(promotion: Promotion) {
  const cap = promotion.maximumDiscountCents === null ? "" : ` Tope: ${formatCartMoney(promotion.maximumDiscountCents)} por pedido.`;
  return `${promotion.percent}% sobre productos en compras superiores a ${formatCartMoney(promotion.minimumCents)}, antes del descuento.${cap} Del 1 al 30/11/2026, horario de Argentina. Un cupón por carrito. No incluye envío; entrega o retiro a coordinar por WhatsApp.`;
}

// Whole-peso suggestion: at exactly $20,000 the customer needs $1 more.
export function pesosToExceedMinimum(subtotalCents: number, promotion: Promotion) {
  return subtotalCents > promotion.minimumCents ? 0 : Math.floor((promotion.minimumCents - subtotalCents) / 100) + 1;
}
