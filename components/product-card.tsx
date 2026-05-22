"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { formatARS } from "@/lib/format";
import type { Product, ProductPresentation } from "@/types/catalog";

type ProductCardProps = {
  product: Product;
  onAdd: (
    product: Product,
    presentation: Product["presentaciones"][number],
    quantity: number,
  ) => void;
};

export function ProductCard({ product, onAdd }: ProductCardProps) {
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
    <article className="card-shadow organic-outline flex h-full flex-col overflow-hidden rounded-[1.8rem] bg-card">
      <div className="relative aspect-[5/4] overflow-hidden bg-olive-soft/45">
        <Image
          src={product.imagen}
          alt={product.nombre}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
          className="object-cover"
        />
        {product.destacado ? (
          <span className="absolute top-4 left-4 rounded-full bg-white/92 px-3 py-1 text-xs font-bold tracking-[0.16em] text-earth uppercase">
            Destacado
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-bold tracking-[0.16em] text-earth uppercase">
          {product.categoria}
        </p>
        <h3 className="mt-2 text-xl font-semibold text-olive-dark">
          {product.nombre}
        </h3>
        <p className="mt-2 text-sm leading-6 text-foreground/68">
          {product.descripcion}
        </p>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-2xl font-semibold text-olive-dark">
              {formatARS(selectedPresentation.precio)}
            </p>
            <p className="mt-1 text-sm text-foreground/58">
              por {selectedPresentation.etiqueta}
            </p>
          </div>
          <span className="rounded-full bg-olive-soft/75 px-3 py-1 text-xs font-semibold text-olive-dark">
            {selectedPresentation.etiqueta}
          </span>
        </div>

        {hasMultiplePresentations ? (
          <div className="mt-5">
            <label
              htmlFor={`presentation-${product.id}`}
              className="mb-2 block text-xs font-bold tracking-[0.14em] text-earth uppercase"
            >
              Elegi el peso
            </label>
            <div className="relative">
              <select
                id={`presentation-${product.id}`}
                value={selectedPresentationLabel}
                onChange={(event) =>
                  setSelectedPresentationLabel(
                    event.target.value as ProductPresentation["etiqueta"],
                  )
                }
                className="w-full appearance-none rounded-2xl border border-olive/12 bg-white/84 px-4 py-3 pr-12 text-sm font-medium text-olive-dark outline-none focus:border-olive/28 focus:ring-2 focus:ring-olive/20"
                aria-label={`Elegir peso para ${product.nombre}`}
              >
                {product.presentaciones.map((presentation) => (
                  <option key={presentation.etiqueta} value={presentation.etiqueta}>
                    {presentation.etiqueta}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-4 inline-flex items-center text-olive-dark/70">
                <ChevronIcon />
              </span>
            </div>
          </div>
        ) : null}

        <div className="mt-5 flex items-center gap-3">
          <div className="inline-flex items-center rounded-full border border-olive/12 bg-white/80 p-1">
            <QuantityButton
              label={`Restar una unidad de ${product.nombre}`}
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            >
              -
            </QuantityButton>
            <span
              className="min-w-10 text-center text-sm font-semibold text-olive-dark"
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
              onAdd(product, selectedPresentation, quantity);
              setQuantity(1);
              setJustAdded(true);
            }}
            className="flex-1 rounded-full bg-olive px-4 py-3 text-sm font-semibold text-white hover:-translate-y-0.5 hover:bg-olive-dark focus:outline-none focus:ring-2 focus:ring-olive/35"
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

  const preferredLabel = preferredLabelByCategory[product.categoria];
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
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold text-olive-dark hover:bg-olive-soft focus:outline-none focus:ring-2 focus:ring-olive/25"
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
