import { formatARS } from "@/lib/format";
import type { CartItem } from "@/types/catalog";

const WHATSAPP_NUMBER = "5491164453032";

export function createWhatsAppUrl(items: CartItem[], subtotal: number) {
  const lines = items.map(
    ({ product, presentation, quantity }) =>
      `- ${quantity} x ${product.nombre} ${presentation.etiqueta} — ${formatARS(
        presentation.precio * quantity,
      )}`,
  );

  const message = [
    "Hola Tierra Sana! 🌱 Quiero hacer este pedido:",
    "",
    ...lines,
    "",
    `Total estimado: ${formatARS(subtotal)}`,
    "",
    "Mi nombre:",
    "Zona de entrega/retiro:",
    "",
    "Gracias!",
  ].join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
