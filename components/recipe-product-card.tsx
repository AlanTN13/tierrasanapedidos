"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { formatARS } from "@/lib/format";
import {
  addRecipeCartItems,
  getDefaultRecipePresentation,
} from "@/lib/recipe-cart";
import type { Product, ProductPresentation } from "@/types/catalog";

type ProductSelection = {
  isSelected: boolean;
  presentationLabel: ProductPresentation["etiqueta"];
};

export function RecipeProductsPicker({ products }: { products: Product[] }) {
  const { addItem, openCart } = useCart();
  const [feedback, setFeedback] = useState("");
  const [selections, setSelections] = useState<Record<string, ProductSelection>>(
    () =>
      Object.fromEntries(
        products.flatMap((product) => {
          const presentationLabel =
            getDefaultRecipePresentation(product)?.etiqueta;
          return presentationLabel
            ? [[product.id, { isSelected: true, presentationLabel }]]
            : [];
        }),
      ),
  );

  const selectedItems = products.flatMap((product) => {
    const selection = selections[product.id];
    if (!selection?.isSelected) return [];

    const presentation = product.presentaciones.find(
      ({ etiqueta }) => etiqueta === selection.presentationLabel,
    );

    return presentation
      ? [{ product, presentation, quantity: 1 as const }]
      : [];
  });

  useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  return (
    <section
      id="productos-receta"
      aria-labelledby="productos-title"
      className="min-w-0 scroll-mt-44 overflow-hidden rounded-2xl border border-olive/20 bg-background p-4 sm:p-5"
    >
      <h2
        id="productos-title"
        className="font-display text-[24px] leading-tight font-semibold text-olive-dark"
      >
        Comprá los ingredientes
      </h2>
      <p className="mt-2 text-[13px] leading-5 text-foreground/65">
        {products.length} productos disponibles en Tierra Sana
      </p>

      <ul className="mt-4 divide-y divide-olive/12 border-y border-olive/12">
        {products.map((product) => {
          const selection = selections[product.id];
          const selectedPresentation =
            product.presentaciones.find(
              ({ etiqueta }) => etiqueta === selection?.presentationLabel,
            ) ?? product.presentaciones[0];

          if (!selection || !selectedPresentation) return null;

          return (
            <li
              key={product.id}
              className={`grid grid-cols-[44px_44px_minmax(0,1fr)] items-start gap-2 py-3 transition-opacity ${
                selection.isSelected ? "" : "opacity-55"
              }`}
            >
              <label className="inline-flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-lg focus-within:ring-2 focus-within:ring-olive/40">
                <input
                  type="checkbox"
                  checked={selection.isSelected}
                  onChange={(event) => {
                    const isSelected = event.target.checked;
                    setSelections((current) => ({
                      ...current,
                      [product.id]: { ...current[product.id], isSelected },
                    }));
                    setFeedback("");
                  }}
                  aria-label={`${selection.isSelected ? "Quitar" : "Agregar"} ${product.nombre}`}
                  className="h-5 w-5 accent-olive"
                />
              </label>

              <div className="relative aspect-square overflow-hidden rounded-lg border border-olive/10 bg-cream/40">
                <Image
                  src={product.imagen}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>

              <div className="min-w-0">
                <h3 className="text-[13px] leading-5 font-semibold text-olive-dark">
                  {product.nombre}
                </h3>
                <p className="mt-0.5 text-[13px] leading-5 font-semibold text-olive-dark">
                  {formatARS(selectedPresentation.precio)}
                </p>
                {product.presentaciones.length > 1 ? (
                  <select
                    value={selection.presentationLabel}
                    onChange={(event) => {
                      const presentationLabel = event.target
                        .value as ProductPresentation["etiqueta"];
                      setSelections((current) => ({
                        ...current,
                        [product.id]: {
                          ...current[product.id],
                          presentationLabel,
                        },
                      }));
                      setFeedback("");
                    }}
                    aria-label={`Elegir presentación de ${product.nombre}`}
                    className="mt-2 min-h-[44px] w-full min-w-0 max-w-full rounded-lg border border-olive/20 bg-cream/45 px-2 text-[16px] font-medium text-olive-dark outline-none focus:ring-2 focus:ring-olive/30 sm:text-[13px]"
                  >
                    {product.presentaciones.map(({ etiqueta }) => (
                      <option key={etiqueta} value={etiqueta}>
                        {etiqueta}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="mt-1 text-xs text-foreground/55">
                    {selectedPresentation.etiqueta}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        disabled={selectedItems.length === 0}
        onClick={() => {
          addRecipeCartItems(selectedItems, addItem);
          setFeedback(
            `${selectedItems.length} productos agregados al carrito.`,
          );
          openCart();
        }}
        className="mt-4 min-h-[48px] w-full rounded-xl bg-olive-dark px-4 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-olive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive disabled:cursor-not-allowed disabled:opacity-45"
      >
        Agregar {selectedItems.length} productos al carrito
      </button>

      <p
        aria-live="polite"
        className="mt-2 text-center text-xs font-semibold text-olive-dark"
      >
        {feedback}
      </p>
    </section>
  );
}
