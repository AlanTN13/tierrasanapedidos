"use client";

import { useEffect, useRef, useState } from "react";
import { createWhatsAppUrl } from "@/lib/whatsapp";
import type { CartItem, ProductPresentation } from "@/types/catalog";
import { useCart } from "@/components/cart-provider";
import { CartCoupon } from "@/components/cart-coupon";
import { formatCartMoney, quoteCart, toCents } from "@/lib/promotions";
import { trackCampaign } from "@/lib/campaign-events";

type CartDrawerProps = {
  items: CartItem[];
  isOpen: boolean;
  subtotal: number;
  onClose: () => void;
  onCheckout: () => void;
  onRemove: (
    productId: string,
    presentationLabel: ProductPresentation["etiqueta"],
  ) => void;
  onUpdateQuantity: (
    productId: string,
    presentationLabel: ProductPresentation["etiqueta"],
    quantity: number,
  ) => void;
};

export function CartDrawer({
  items,
  isOpen,
  subtotal,
  onClose,
  onCheckout,
  onRemove,
  onUpdateQuantity,
}: CartDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);
  const { couponCode, quote, promotion, checkoutNow, isPreview } = useCart();
  const [previewMessage, setPreviewMessage] = useState("");
  void subtotal;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousFocus = document.activeElement;
    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function trapFocus(event: KeyboardEvent) {
      if (event.key !== "Tab") return;
      const controls = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input, a[href], [tabindex="0"]');
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", trapFocus);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", trapFocus);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [isOpen]);

  function handleCheckout() {
    const instant = checkoutNow();
    const current = quoteCart(quote.subtotalCents, couponCode, instant, promotion);
    const whatsappUrl = createWhatsAppUrl(items, quote.subtotalCents / 100, couponCode, instant, promotion);
    if (isPreview) { setPreviewMessage(new URL(whatsappUrl).searchParams.get("text") ?? ""); return; }
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    trackCampaign("whatsapp_order_intent", { subtotal_cents: current.subtotalCents, discount_cents: current.discountCents, total_cents: current.totalCents, coupon_status: current.status });
    onCheckout();
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 transition">
      <button
        type="button"
        aria-label="Cerrar carrito"
        onClick={onClose}
        className="absolute inset-0 bg-[#2f3328]/28 backdrop-blur-[2px] transition-opacity opacity-100"
      />

      <aside
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className="absolute right-0 bottom-0 flex h-[88vh] w-full max-w-xl flex-col rounded-t-[2rem] border border-white/55 bg-[#fffdf9] shadow-[0_28px_80px_rgba(63,74,47,0.25)] transition-transform duration-300 translate-y-0 sm:top-0 sm:h-full sm:translate-x-0 sm:rounded-none sm:rounded-l-[2rem]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-olive/10 px-5 py-5 sm:px-6">
          <div>
            <p className="section-kicker">Tu pedido</p>
            <h2 id="cart-title" className="mt-3 text-2xl font-semibold text-olive-dark">
              Carrito saludable
            </h2>
            <p className="mt-2 text-sm leading-6 text-foreground/64">
              Revisa cantidades y envia el resumen por WhatsApp para confirmar
              stock, precios y retiro.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            ref={closeButtonRef}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-olive-soft/75 text-olive-dark hover:bg-olive-soft focus:outline-none focus:ring-2 focus:ring-olive/25"
            aria-label="Cerrar carrito"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
          {items.length === 0 ? (
            <div className="rounded-[1.6rem] border border-dashed border-olive/18 bg-cream/70 p-6 text-center">
              <p className="font-semibold text-olive-dark">Tu carrito esta vacio</p>
              <p className="mt-2 text-sm leading-6 text-foreground/64">
                Suma productos desde el catalogo para enviar tu pedido armado.
              </p>
            </div>
          ) : (
            items.map(({ product, presentation, quantity }) => (
              <article
                key={`${product.id}-${presentation.etiqueta}`}
                className="organic-outline rounded-[1.5rem] bg-card-strong/65 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-olive-dark">
                      {product.nombre}
                    </p>
                    <p className="mt-1 text-sm text-foreground/62">
                      {presentation.etiqueta} · {formatCartMoney(toCents(presentation.precio))}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(product.id, presentation.etiqueta)}
                    className="rounded-full px-2 py-1 text-sm font-semibold text-earth hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-olive/25"
                  >
                    Quitar
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="inline-flex items-center rounded-full border border-olive/10 bg-white/84 p-1">
                    <QuantityControl
                      label={`Restar ${product.nombre}`}
                      onClick={() =>
                        onUpdateQuantity(
                          product.id,
                          presentation.etiqueta,
                          quantity - 1,
                        )
                      }
                    >
                      -
                    </QuantityControl>
                    <span className="min-w-10 text-center text-sm font-semibold text-olive-dark">
                      {quantity}
                    </span>
                    <QuantityControl
                      label={`Sumar ${product.nombre}`}
                      onClick={() =>
                        onUpdateQuantity(
                          product.id,
                          presentation.etiqueta,
                          quantity + 1,
                        )
                      }
                    >
                      +
                    </QuantityControl>
                  </div>

                  <p className="text-base font-semibold text-olive-dark">
                    {formatCartMoney(toCents(presentation.precio) * quantity)}
                  </p>
                </div>
              </article>
            ))
          )}
          <CartCoupon />
          {isPreview && previewMessage ? <div className="rounded-2xl bg-white p-4 text-sm text-olive-dark">
            <p className="mb-2 font-semibold">Mensaje de prueba · no se abrió WhatsApp</p>
            <textarea aria-label="Mensaje de WhatsApp de prueba" value={previewMessage} readOnly rows={12} className="w-full min-w-0 rounded-xl border border-olive/20 p-2" />
          </div> : null}
        </div>

        <div className="border-t border-olive/10 bg-white/86 px-5 py-5 sm:px-6">
          {quote.status === "applied" ? (
            <dl className="mb-3 space-y-1 text-sm text-olive-dark">
              <div className="flex justify-between gap-3"><dt>Subtotal de productos</dt><dd>{formatCartMoney(quote.subtotalCents)}</dd></div>
              <div className="flex justify-between gap-3"><dt>Descuento {quote.percent}%</dt><dd>-{formatCartMoney(quote.discountCents)}</dd></div>
            </dl>
          ) : null}
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-foreground/62">Total estimado</p>
            <p className="text-2xl font-semibold text-olive-dark">
              {formatCartMoney(quote.totalCents)}
            </p>
          </div>

          {items.length > 0 ? (
            <button
              type="button"
              onClick={handleCheckout}
              className="inline-flex w-full items-center justify-center rounded-full bg-olive px-5 py-3.5 text-sm font-semibold text-white hover:bg-olive-dark focus:outline-none focus:ring-2 focus:ring-olive/35"
            >
              Enviar pedido por WhatsApp
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="w-full rounded-full bg-olive/45 px-5 py-3.5 text-sm font-semibold text-white"
            >
              Enviar pedido por WhatsApp
            </button>
          )}

          <p className="mt-3 text-center text-xs leading-5 text-foreground/58">
            La compra, los precios y el stock se confirman por WhatsApp.
            Entrega o retiro a coordinar; envío no incluido.
          </p>
        </div>
      </aside>
    </div>
  );
}

type QuantityControlProps = {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
};

function QuantityControl({
  label,
  onClick,
  children,
}: QuantityControlProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold text-olive-dark hover:bg-olive-soft focus:outline-none focus:ring-2 focus:ring-olive/25"
    >
      {children}
    </button>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
