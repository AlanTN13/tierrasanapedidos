"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { addItemToStoredCart } from "@/components/cart-provider";
import { formatARS } from "@/lib/format";
import type { Product, ProductPresentation } from "@/types/catalog";

type RecipeProductCardProps = {
  product: Product;
};

export function RecipeProductCard({ product }: RecipeProductCardProps) {
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
    <article className="organic-outline overflow-hidden rounded-[1.6rem] bg-white/86">
      <div className="relative aspect-[1.18/1] overflow-hidden bg-olive-soft/35">
        <Image
          src={product.imagen}
          alt={product.nombre}
          fill
          sizes="(max-width: 1280px) 50vw, 33vw"
          className="object-cover"
        />
      </div>

      <div className="p-4">
        <p className="text-[0.7rem] font-bold tracking-[0.14em] text-earth uppercase">
          {product.categoria}
        </p>
        <h3 className="mt-2 text-xl font-semibold text-olive-dark">
          {product.nombre}
        </h3>
        <p className="mt-2 text-sm leading-6 text-foreground/66">
          {product.descripcion}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-olive-dark">
              {formatARS(selectedPresentation.precio)}
            </p>
            <p className="text-sm text-foreground/58">
              por {selectedPresentation.etiqueta}
            </p>
          </div>
          <span className="rounded-full bg-olive-soft/76 px-3 py-1 text-xs font-semibold text-olive-dark">
            {selectedPresentation.etiqueta}
          </span>
        </div>

        {hasMultiplePresentations ? (
          <div className="mt-4">
            <label
              htmlFor={`recipe-presentation-${product.id}`}
              className="mb-2 block text-xs font-bold tracking-[0.14em] text-earth uppercase"
            >
              Elegí el peso
            </label>
            <div className="relative">
              <select
                id={`recipe-presentation-${product.id}`}
                value={selectedPresentationLabel}
                onChange={(event) =>
                  setSelectedPresentationLabel(
                    event.target.value as ProductPresentation["etiqueta"],
                  )
                }
                className="w-full appearance-none rounded-2xl border border-olive/12 bg-white/84 px-4 py-3 pr-12 text-sm font-medium text-olive-dark outline-none focus:border-olive/28 focus:ring-2 focus:ring-olive/20"
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

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              addItemToStoredCart(product, selectedPresentation, 1);
              setJustAdded(true);
            }}
            className="inline-flex items-center justify-center rounded-full bg-olive px-4 py-2.5 text-sm font-semibold text-white hover:bg-olive-dark"
          >
            {justAdded ? "Agregado" : "Agregar al carrito"}
          </button>
          <Link
            href={`/?q=${encodeURIComponent(product.nombre)}`}
            className="inline-flex items-center justify-center rounded-full border border-olive/14 bg-white px-4 py-2.5 text-sm font-semibold text-olive-dark"
          >
            Ver en catálogo
          </Link>
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
