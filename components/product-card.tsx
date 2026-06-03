"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getPrimaryCategory } from "@/lib/catalog";
import { formatARS } from "@/lib/format";
import type { Product, ProductPresentation } from "@/types/catalog";

type ProductCardProps = {
  product: Product;
  hideFeaturedBadge?: boolean;
  compact?: boolean;
  onOpenDetail: (
    product: Product,
    presentation: Product["presentaciones"][number],
    primaryCategory: string,
  ) => void;
  onAdd: (
    product: Product,
    presentation: Product["presentaciones"][number],
    quantity: number,
  ) => void;
};

export function ProductCard({
  product,
  hideFeaturedBadge = false,
  compact = false,
  onOpenDetail,
  onAdd,
}: ProductCardProps) {
  void compact;

  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [selectedPresentationLabel, setSelectedPresentationLabel] = useState(
    getDefaultPresentationLabel(product),
  );

  const selectedPresentation =
    product.presentaciones.find(
      (presentation) => presentation.etiqueta === selectedPresentationLabel,
    ) ?? product.presentaciones[0];

  const hasMultiplePresentations = product.presentaciones.length > 1;
  const primaryCategory = getPrimaryCategory(product);

  useEffect(() => {
    if (!justAdded) {
      return;
    }

    const timeoutId = window.setTimeout(() => setJustAdded(false), 1800);

    return () => window.clearTimeout(timeoutId);
  }, [justAdded]);

  return (
    <article className="card-shadow organic-outline flex h-full flex-col overflow-hidden rounded-[1.15rem] bg-card">
      <div className="relative aspect-square overflow-hidden bg-olive-soft/45">
        <Image
          src={product.imagen}
          alt={product.nombre}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw"
          className="object-cover"
        />
        {product.destacado && !hideFeaturedBadge ? (
          <span className="absolute top-3 left-3 rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-bold tracking-[0.16em] text-earth uppercase">
            Destacado
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <p className="text-[10px] font-bold tracking-[0.16em] text-earth uppercase">
          {primaryCategory}
        </p>
        <h3 className="mt-1 text-[15px] leading-tight font-semibold text-olive-dark">
          {product.nombre}
        </h3>

        <div className="mt-2 flex items-end justify-between gap-2">
          <div>
            <p className="text-base font-semibold text-olive-dark">
              {formatARS(selectedPresentation.precio)}
            </p>
            <p className="mt-0.5 text-[11px] text-foreground/58">
              por {selectedPresentation.etiqueta}
            </p>
          </div>
        </div>

        {hasMultiplePresentations ? (
          <div className="mt-2.5">
            <div className="relative">
              <select
                id={`presentation-${product.id}`}
                value={selectedPresentationLabel}
                onChange={(event) =>
                  setSelectedPresentationLabel(
                    event.target.value as ProductPresentation["etiqueta"],
                  )
                }
                className="w-full appearance-none rounded-[0.95rem] border border-olive/12 bg-white/84 px-3 py-2 pr-9 text-[12px] font-medium text-olive-dark outline-none focus:border-olive/28 focus:ring-2 focus:ring-olive/20"
                aria-label={`Elegir peso para ${product.nombre}`}
              >
                {product.presentaciones.map((presentation) => (
                  <option key={presentation.etiqueta} value={presentation.etiqueta}>
                    {presentation.etiqueta}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-3 inline-flex items-center text-olive-dark/70">
                <ChevronIcon />
              </span>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => onOpenDetail(product, selectedPresentation, primaryCategory)}
          className="mt-3 rounded-full border border-olive/14 bg-white px-3 py-2 text-[12px] font-semibold text-olive-dark hover:bg-olive-soft/36 focus:outline-none focus:ring-2 focus:ring-olive/25"
        >
          Ver detalle
        </button>

        <div className="mt-3 flex items-center gap-2">
          <div className="inline-flex items-center rounded-full border border-olive/12 bg-white/80 p-0.5">
            <QuantityButton
              label={`Restar una unidad de ${product.nombre}`}
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              compact
            >
              -
            </QuantityButton>
            <span
              className="min-w-7 text-center text-[12px] font-semibold text-olive-dark"
              aria-live="polite"
            >
              {quantity}
            </span>
            <QuantityButton
              label={`Sumar una unidad de ${product.nombre}`}
              onClick={() => setQuantity((current) => current + 1)}
              compact
            >
              +
            </QuantityButton>
          </div>

          <button
            type="button"
            onClick={() => {
              onAdd(product, selectedPresentation, quantity);
              setQuantity(1);
              setJustAdded(true);
            }}
            className="flex-1 rounded-full bg-olive px-3 py-2 text-[12px] font-semibold text-white hover:-translate-y-0.5 hover:bg-olive-dark focus:outline-none focus:ring-2 focus:ring-olive/35"
          >
            {justAdded ? "Agregado" : "Agregar"}
          </button>
        </div>
      </div>
    </article>
  );
}

type ProductDetailDialogProps = {
  product: Product;
  selectedPresentation: Product["presentaciones"][number];
  primaryCategory: string;
  isOpen: boolean;
  onClose: () => void;
};

export function ProductDetailDialog({
  product,
  selectedPresentation,
  primaryCategory,
  isOpen,
  onClose,
}: ProductDetailDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-[#2f3328]/28 backdrop-blur-[2px]"
        aria-label={`Cerrar detalle de ${product.nombre}`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`product-detail-title-${product.id}`}
        className="organic-outline relative z-10 w-full max-w-2xl overflow-hidden rounded-[2rem] bg-[#fffdf9] shadow-[0_24px_80px_rgba(63,74,47,0.22)]"
      >
        <div className="grid md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="relative aspect-[1.08/1] overflow-hidden bg-olive-soft/35 md:aspect-auto md:h-full">
            <Image
              src={product.imagen}
              alt={product.nombre}
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
            />
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold tracking-[0.16em] text-earth uppercase">
                  {primaryCategory}
                </p>
                <h3
                  id={`product-detail-title-${product.id}`}
                  className="mt-2 text-2xl leading-tight font-semibold text-olive-dark"
                >
                  {product.nombre}
                </h3>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-olive/12 bg-white text-olive-dark hover:bg-olive-soft/45 focus:outline-none focus:ring-2 focus:ring-olive/25"
                aria-label={`Cerrar detalle de ${product.nombre}`}
              >
                <CloseIcon />
              </button>
            </div>

            <p className="mt-4 text-sm leading-6 text-foreground/72">
              {product.descripcion}
            </p>

            <div className="mt-5 rounded-[1.25rem] bg-olive-soft/38 p-4">
              <p className="text-[11px] font-bold tracking-[0.14em] text-earth uppercase">
                Presentacion seleccionada
              </p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xl font-semibold text-olive-dark">
                    {formatARS(selectedPresentation.precio)}
                  </p>
                  <p className="mt-0.5 text-sm text-foreground/62">
                    por {selectedPresentation.etiqueta}
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-olive-dark">
                  {selectedPresentation.etiqueta}
                </span>
              </div>
            </div>

            {product.presentaciones.length > 1 ? (
              <div className="mt-5">
                <p className="text-[11px] font-bold tracking-[0.14em] text-earth uppercase">
                  Otras presentaciones
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.presentaciones.map((presentation) => (
                    <span
                      key={presentation.etiqueta}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        presentation.etiqueta === selectedPresentation.etiqueta
                          ? "bg-olive text-white"
                          : "bg-white text-olive-dark shadow-[0_8px_18px_rgba(111,127,79,0.08)]"
                      }`}
                    >
                      {presentation.etiqueta}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-olive/14 bg-white px-4 py-2.5 text-sm font-semibold text-olive-dark hover:bg-olive-soft/36 focus:outline-none focus:ring-2 focus:ring-olive/25"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getDefaultPresentationLabel(product: Product) {
  const preferredLabelByCategory: Record<string, ProductPresentation["etiqueta"]> = {
    Legumbres: "500g",
    Semillas: "250g",
  };

  const preferredLabel = preferredLabelByCategory[getPrimaryCategory(product)];
  const matchingPresentation = product.presentaciones.find(
    (presentation) => presentation.etiqueta === preferredLabel,
  );

  return matchingPresentation?.etiqueta ?? product.presentaciones[0]?.etiqueta ?? "unidad";
}

type QuantityButtonProps = {
  label: string;
  onClick: () => void;
  compact?: boolean;
  children: React.ReactNode;
};

function QuantityButton({ label, onClick, compact = false, children }: QuantityButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`inline-flex items-center justify-center rounded-full font-semibold text-olive-dark hover:bg-olive-soft focus:outline-none focus:ring-2 focus:ring-olive/25 ${compact ? "h-7 w-7 text-[15px]" : "h-9 w-9 text-lg"}`}
    >
      {children}
    </button>
  );
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 7.5 5 5 5-5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
