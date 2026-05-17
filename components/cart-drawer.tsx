"use client";

import { useEffect } from "react";
import { createWhatsAppUrl } from "@/lib/whatsapp";
import { formatARS } from "@/lib/format";
import type { CartItem, ProductPresentation } from "@/types/catalog";

type CartDrawerProps = {
  items: CartItem[];
  isOpen: boolean;
  subtotal: number;
  onClose: () => void;
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
  onRemove,
  onUpdateQuantity,
}: CartDrawerProps) {
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

  const whatsappUrl = createWhatsAppUrl(items, subtotal);

  return (
    <div
      className={`fixed inset-0 z-50 transition ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="Cerrar carrito"
        onClick={onClose}
        className={`absolute inset-0 bg-[#2f3328]/28 backdrop-blur-[2px] transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className={`absolute right-0 bottom-0 flex h-[88vh] w-full max-w-xl flex-col rounded-t-[2rem] border border-white/55 bg-[#fffdf9] shadow-[0_28px_80px_rgba(63,74,47,0.25)] transition-transform duration-300 sm:top-0 sm:h-full sm:rounded-none sm:rounded-l-[2rem] ${
          isOpen ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-x-full"
        }`}
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
                      {presentation.etiqueta} · {formatARS(presentation.precio)}
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
                    {formatARS(presentation.precio * quantity)}
                  </p>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="border-t border-olive/10 bg-white/86 px-5 py-5 sm:px-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-foreground/62">Total estimado</p>
            <p className="text-2xl font-semibold text-olive-dark">
              {formatARS(subtotal)}
            </p>
          </div>

          {items.length > 0 ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center rounded-full bg-olive px-5 py-3.5 text-sm font-semibold text-white hover:bg-olive-dark focus:outline-none focus:ring-2 focus:ring-olive/35"
            >
              Enviar pedido por WhatsApp
            </a>
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
            Los precios y stock pueden confirmarse por WhatsApp antes de cerrar
            el pedido.
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
