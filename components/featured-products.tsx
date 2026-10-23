"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatARS } from "@/lib/format";
import { getDefaultProductPresentation } from "@/lib/product-purchase";
import type { Product, ProductPresentation } from "@/types/catalog";

export function FeaturedProducts({
  products,
  onAdd,
}: {
  products: Product[];
  onAdd: (
    product: Product,
    presentation: ProductPresentation,
    quantity: number,
  ) => void;
}) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section
      id="destacados"
      aria-labelledby="featured-title"
      className="container-shell pb-10 sm:pb-14"
    >
      <h2
        id="featured-title"
        className="font-display text-[22px] font-semibold text-olive-dark sm:text-[26px]"
      >
        Los más elegidos
      </h2>

      <div className="mt-3 flex snap-x snap-mandatory gap-[10px] overflow-x-auto pb-3 [scrollbar-width:thin] [scrollbar-color:var(--olive-soft)_transparent] [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-olive/40 sm:mt-4 sm:gap-3 lg:grid lg:grid-cols-4 lg:overflow-visible xl:grid-cols-6">
        {products.map((product) => (
          <FeaturedProductCard key={product.id} product={product} onAdd={onAdd} />
        ))}
      </div>
    </section>
  );
}

function FeaturedProductCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (
    product: Product,
    presentation: ProductPresentation,
    quantity: number,
  ) => void;
}) {
  const [justAdded, setJustAdded] = useState(false);
  const presentation = getDefaultProductPresentation(product);

  useEffect(() => {
    if (!justAdded) return;

    const timeoutId = window.setTimeout(() => setJustAdded(false), 1600);
    return () => window.clearTimeout(timeoutId);
  }, [justAdded]);

  if (!presentation) {
    return null;
  }

  return (
    <article className="flex min-w-0 shrink-0 basis-[calc(50%-22px)] snap-start flex-col overflow-hidden rounded-2xl bg-white sm:basis-[192px] lg:basis-auto">
      <Link
        href={`/producto/${product.id}`}
        className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-[#f7f4eb] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-olive"
        aria-label={`Ver ${product.nombre}`}
      >
        <Image
          src={product.imagen}
          alt={product.nombre}
          fill
          sizes="(max-width: 639px) calc((100vw - 60px) / 2), (max-width: 1023px) 192px, (max-width: 1279px) 25vw, 17vw"
          className="object-contain transition duration-300 group-hover:scale-[1.03]"
        />
      </Link>

      <div className="flex flex-1 flex-col px-2 pt-2.5 pb-2 sm:px-3 sm:pb-3">
        <Link
          href={`/producto/${product.id}`}
          className="line-clamp-2 min-h-[36px] text-[13px] leading-[18px] font-semibold text-olive-dark hover:text-olive focus:outline-none focus-visible:underline sm:min-h-[40px] sm:text-sm sm:leading-5"
        >
          {product.nombre}
        </Link>
        <p className="mt-1 text-[11px] text-foreground/65 sm:text-xs">
          {presentation.etiqueta}
        </p>
        <div className="mt-auto flex min-h-[44px] items-center justify-between gap-1 pt-1">
          <p className="min-w-0 text-[16px] leading-tight font-bold text-olive-dark tabular-nums [overflow-wrap:anywhere] sm:text-[18px]">
            {formatARS(presentation.precio)}
          </p>
          <button
            type="button"
            onClick={() => {
              onAdd(product, presentation, 1);
              setJustAdded(true);
            }}
            className="group inline-flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-olive/50 focus-visible:ring-offset-1"
            aria-label={`Agregar ${product.nombre}, ${presentation.etiqueta}`}
          >
            <span className="inline-flex h-[36px] w-[36px] items-center justify-center rounded-full bg-olive text-white transition-colors group-hover:bg-olive-dark">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path d={justAdded ? "m5 12 4 4L19 6" : "M12 5v14M5 12h14"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        </div>
        <span className="sr-only" role="status">
          {justAdded ? `${product.nombre} agregado al carrito` : ""}
        </span>
      </div>
    </article>
  );
}
