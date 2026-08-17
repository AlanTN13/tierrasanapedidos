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
      className="scroll-mt-28 rounded-[1.45rem] border border-olive/10 bg-olive-soft/35 px-4 py-5 sm:scroll-mt-32 sm:px-6 sm:py-7"
    >
      <h2
        id="productos-title"
        className="font-display text-3xl font-semibold text-olive-dark"
      >
        Comprá los ingredientes
      </h2>
      <p className="mt-2 text-sm leading-6 text-foreground/62">
        {products.length} productos disponibles en Tierra Sana
      </p>

      <ul className="mt-5 divide-y divide-olive/12 border-y border-olive/12">
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
              className={`grid grid-cols-[auto_2.75rem_minmax(0,1fr)_auto] items-center gap-2.5 py-3.5 transition sm:grid-cols-[auto_3rem_minmax(0,1fr)_auto] sm:gap-3 ${
                selection.isSelected ? "" : "opacity-55"
              }`}
            >
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
                  className="h-4.5 w-4.5 accent-olive"
                />

                <div className="relative aspect-square overflow-hidden rounded-lg bg-white/70">
                  <Image
                    src={product.imagen}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm leading-5 font-semibold text-olive-dark">
                    {product.nombre}
                  </h3>
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
                      className="mt-1.5 max-w-full rounded-md border border-olive/14 bg-white/88 px-2 py-1.5 text-xs font-medium text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
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

                <span className="text-xs font-semibold text-olive-dark">
                  {formatARS(selectedPresentation.precio)}
                </span>
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
        className="mt-5 w-full rounded-full bg-olive px-5 py-3 text-sm font-semibold text-white transition hover:bg-olive-dark focus:outline-none focus:ring-2 focus:ring-olive/30 disabled:cursor-not-allowed disabled:opacity-45"
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
