"use client";

import Image from "next/image";
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

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 transition">
      <button
        type="button"
        aria-label="Cerrar carrito"
        onClick={onClose}
        className="absolute inset-0 bg-[#283020]/40 backdrop-blur-[3px]"
      />

      <aside
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className="absolute right-0 bottom-0 flex h-[94dvh] max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-[1.75rem] bg-[#fffdf8] shadow-[-16px_0_80px_rgba(30,40,25,0.2)] sm:top-0 sm:h-dvh sm:max-w-[520px] sm:rounded-none sm:rounded-l-[1.75rem]"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#e9e7dc] px-5 py-5 sm:px-7 sm:py-6">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#6f775f] uppercase">Tierra Sana</p>
            <h2 id="cart-title" className="mt-1 flex flex-wrap items-center gap-3 font-display text-[2rem] leading-tight tracking-[-0.03em] text-[#35432d]">
              Tu carrito
              <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[#eaf0df] px-2 font-sans text-xs font-semibold tracking-normal text-[#53633e]" aria-label={`${itemCount} ${itemCount === 1 ? "producto" : "productos"}`}>{itemCount}</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            ref={closeButtonRef}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e4e6da] bg-white text-[#53633e] transition hover:bg-[#edf1e5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive"
            aria-label="Cerrar carrito"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7">
          {items.length === 0 ? (
            <div className="py-5 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#edf1e4] text-[#6f7f4f]"><BagIcon /></span>
              <p className="mt-4 font-display text-2xl text-[#35432d]">Tu carrito está vacío</p>
              <p className="mt-2 text-sm leading-6 text-[#727768]">Elegí tus favoritos y armá tu pedido.</p>
              <button type="button" onClick={onClose} className="mt-3 rounded-lg px-3 py-2 text-sm font-semibold text-[#455638] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-olive">Seguir comprando</button>
            </div>
          ) : (
            items.map(({ product, presentation, quantity }) => (
              <article
                key={`${product.id}-${presentation.etiqueta}`}
                className="flex gap-3.5 border-b border-[#e9e7dc] pb-5 last:border-b-0 last:pb-0"
              >
                <div className="h-[84px] w-[76px] shrink-0 overflow-hidden rounded-xl border border-[#efebdf] bg-[#f5f2e9] sm:h-[96px] sm:w-[88px]">
                  <Image src={product.imagen || "/productos/placeholder.svg"} alt="" width={88} height={96} sizes="88px" className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 text-sm leading-5 font-semibold break-words text-[#35432d] sm:text-base sm:leading-6">
                      {product.nombre}
                    </p>
                    <button type="button" onClick={() => onRemove(product.id, presentation.etiqueta)} aria-label={`Quitar ${product.nombre} ${presentation.etiqueta}`} className="-mt-1 -mr-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#8a8f80] hover:bg-[#f0eee6] hover:text-[#6b5138] focus-visible:outline-2 focus-visible:outline-olive"><TrashIcon /></button>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[#727768]">{presentation.etiqueta} · {formatCartMoney(toCents(presentation.precio))} c/u</p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="inline-flex items-center rounded-xl border border-[#dfe3d6] bg-white p-0.5">
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
                      <span className="min-w-7 text-center text-sm font-semibold text-[#35432d]" aria-live="polite">
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
                    <p className="ml-auto text-sm font-semibold tabular-nums text-[#35432d] sm:text-base">{formatCartMoney(toCents(presentation.precio) * quantity)}</p>
                  </div>
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

        <div className="shrink-0 border-t border-[#e9e7dc] bg-white px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(50,65,40,0.035)] sm:px-7 sm:pt-5">
          {quote.status === "applied" ? (
            <dl className="mb-3 space-y-2 text-sm text-[#727768]">
              <div className="flex justify-between gap-3"><dt>Subtotal de productos</dt><dd>{formatCartMoney(quote.subtotalCents)}</dd></div>
              <div className="flex justify-between gap-3 font-medium text-[#536d31]"><dt>Descuento {quote.percent}%</dt><dd>-{formatCartMoney(quote.discountCents)}</dd></div>
            </dl>
          ) : null}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <p className="text-sm font-medium text-[#68725c]">Total estimado</p>
            <p className="ml-auto text-[1.85rem] leading-tight font-semibold tracking-tight tabular-nums text-[#35432d]">
              {formatCartMoney(quote.totalCents)}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={items.length === 0}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#455638] px-3 py-3.5 text-sm font-semibold text-white shadow-[0_5px_14px_rgba(69,86,56,0.14)] hover:bg-[#35432d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive disabled:cursor-not-allowed disabled:bg-[#c3cbb7] disabled:shadow-none"
          >
            <WhatsAppIcon />
            Enviar pedido por WhatsApp
          </button>
          <p className="mt-3 text-center text-[11px] leading-4 text-[#74796c]">Confirmás tu compra por WhatsApp. No incluye envío.</p>
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
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-lg font-medium text-[#53633e] hover:bg-[#edf1e5] focus-visible:outline-2 focus-visible:outline-olive"
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

function TrashIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6M14 10v6" /></svg>;
}

function BagIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 7h14l1 14H4L5 7ZM9 8V6a3 3 0 0 1 6 0v2" /></svg>;
}

function WhatsAppIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l1.7-5.1A8.5 8.5 0 1 1 21 11.5Z" /><path d="m8.5 7.5 1.3 2.4-1 1.1c.9 1.7 2.1 2.9 3.8 3.6l1-1.1 2.6 1.2c-.5 2.9-4.4 1.7-6.9-.8-2.5-2.4-3.7-5.9-.8-6.4Z" /></svg>;
}
