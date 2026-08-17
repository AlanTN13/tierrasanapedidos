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
        className="font-display text-2xl font-semibold text-olive-dark sm:text-3xl"
      >
        Los más elegidos
      </h2>

      <div className="-mx-1.5 mt-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-1.5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-5 sm:gap-3 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 xl:grid-cols-6">
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
    <article className="flex w-[9.75rem] min-w-[9.75rem] snap-start flex-col overflow-hidden rounded-[1.2rem] bg-white shadow-[0_8px_24px_rgba(47,51,40,0.09)] ring-1 ring-olive/8 sm:w-[12rem] sm:min-w-[12rem] lg:w-auto lg:min-w-0">
      <Link
        href={`/producto/${product.id}`}
        className="group relative aspect-[4/3] overflow-hidden bg-[#f7f4eb] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-olive"
        aria-label={`Ver ${product.nombre}`}
      >
        <Image
          src={product.imagen}
          alt={product.nombre}
          fill
          sizes="(max-width: 639px) 156px, (max-width: 1023px) 192px, 17vw"
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <Link
          href={`/producto/${product.id}`}
          className="line-clamp-2 min-h-9 text-[13px] leading-[1.15rem] font-semibold text-olive-dark hover:text-olive focus:outline-none focus-visible:underline sm:text-sm sm:leading-5"
        >
          {product.nombre}
        </Link>
        <p className="mt-1.5 text-[11px] text-foreground/58 sm:text-xs">
          {presentation.etiqueta}
        </p>
        <p className="mt-0.5 text-base font-semibold text-olive-dark sm:text-lg">
          {formatARS(presentation.precio)}
        </p>
        <button
          type="button"
          onClick={() => {
            onAdd(product, presentation, 1);
            setJustAdded(true);
          }}
          className="mt-2.5 inline-flex min-h-9 w-full items-center justify-center rounded-full bg-olive px-3 py-1.5 text-xs font-semibold text-white hover:bg-olive-dark focus:outline-none focus:ring-2 focus:ring-olive/35"
          aria-label={`Agregar ${product.nombre}, ${presentation.etiqueta}`}
        >
          {justAdded ? "Agregado" : "Agregar  +"}
        </button>
      </div>
    </article>
  );
}
