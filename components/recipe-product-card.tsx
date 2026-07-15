"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { addItemToStoredCart } from "@/components/cart-provider";
import { getPrimaryCategory } from "@/lib/catalog";
import { formatARS } from "@/lib/format";
import type { Product, ProductPresentation } from "@/types/catalog";

type RecipeProductCardProps = {
  product: Product;
};

export function RecipeProductCard({ product }: RecipeProductCardProps) {
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
      </div>

      <div className="flex flex-1 flex-col p-3">
        <p className="text-[10px] font-bold tracking-[0.16em] text-earth uppercase">
          {getPrimaryCategory(product)}
        </p>
        <h3 className="mt-1 min-h-[2.5rem] line-clamp-2 text-[15px] leading-tight font-semibold text-olive-dark">
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
                id={`recipe-presentation-${product.id}`}
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

        <Link
          href={`/?q=${encodeURIComponent(product.nombre)}`}
          className="mt-3 rounded-full border border-olive/14 bg-white px-3 py-2 text-center text-[12px] font-semibold text-olive-dark hover:bg-olive-soft/36"
        >
          Ver en catálogo
        </Link>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="inline-flex w-full items-center justify-center rounded-full border border-olive/12 bg-white/80 p-0.5 sm:w-auto">
            <QuantityButton
              label={`Restar una unidad de ${product.nombre}`}
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
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
            >
              +
            </QuantityButton>
          </div>

          <button
            type="button"
            onClick={() => {
              addItemToStoredCart(product, selectedPresentation, quantity);
              setQuantity(1);
              setJustAdded(true);
            }}
            className="w-full min-w-0 rounded-full bg-olive px-3 py-2 text-[12px] font-semibold text-white hover:bg-olive-dark sm:flex-1 sm:w-auto"
          >
            {justAdded ? "Agregado" : "Agregar"}
          </button>
        </div>
      </div>
    </article>
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
  children: React.ReactNode;
};

function QuantityButton({ label, onClick, children }: QuantityButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-base font-semibold text-olive-dark hover:bg-olive-soft focus:outline-none focus:ring-2 focus:ring-olive/25"
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
