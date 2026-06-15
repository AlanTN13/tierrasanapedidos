"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import type { AdminCatalogProduct } from "@/lib/catalog-data";

type ProductsListProps = {
  products: AdminCatalogProduct[];
  categoryNameById: Record<string, string>;
};

export function ProductsList({ products, categoryNameById }: ProductsListProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalizeSearchText(deferredQuery);

    if (!normalizedQuery) {
      return products;
    }

    return products.filter((product) => {
      const haystack = normalizeSearchText([
        product.name,
        product.slug,
        product.description,
        product.tags.join(" "),
        product.categoryIds.map((categoryId) => categoryNameById[categoryId] ?? categoryId).join(" "),
        product.presentations.map((presentation) => presentation.etiqueta).join(" "),
      ].join(" "));

      return haystack.includes(normalizedQuery);
    });
  }, [categoryNameById, deferredQuery, products]);

  return (
    <div className="space-y-4">
      <section className="surface-panel organic-outline rounded-[1.8rem] p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-olive-dark">Buscar producto</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nombre, categoría, slug o presentación"
              className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
            />
          </label>

          <div className="rounded-2xl border border-olive/10 bg-olive-soft/24 px-4 py-3 text-sm text-olive-dark">
            {filteredProducts.length} de {products.length} productos
          </div>
        </div>
      </section>

      <section className="surface-panel organic-outline overflow-hidden rounded-[2rem]">
        <div className="grid gap-px bg-olive/8">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <article
                key={product.uuid}
                className="grid gap-4 bg-white/92 px-5 py-4 md:grid-cols-[minmax(0,1fr)_220px_150px]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-olive-dark">{product.name}</h2>
                    {product.isFeatured ? (
                      <span className="rounded-full bg-earth/10 px-2.5 py-1 text-[11px] font-semibold text-earth">
                        Destacado
                      </span>
                    ) : null}
                    {!product.isActive ? (
                      <span className="rounded-full bg-foreground/8 px-2.5 py-1 text-[11px] font-semibold text-foreground/72">
                        Inactivo
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-foreground/62">/{product.slug}</p>
                  <p className="mt-3 text-sm leading-6 text-foreground/68">{product.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.categoryIds.map((categoryId) => (
                      <span
                        key={categoryId}
                        className="rounded-full bg-olive-soft/48 px-2.5 py-1 text-[11px] font-semibold text-olive-dark"
                      >
                        {categoryNameById[categoryId] ?? categoryId}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-olive-dark">
                  {product.presentations.map((presentation) => (
                    <div
                      key={`${product.uuid}-${presentation.id ?? presentation.etiqueta}`}
                      className="rounded-2xl border border-olive/10 bg-olive-soft/26 px-3 py-2"
                    >
                      <strong>{presentation.etiqueta}</strong>
                      <div>${presentation.precio.toLocaleString("es-AR")}</div>
                    </div>
                  ))}
                </div>

                <div className="flex items-start justify-start md:justify-end">
                  <Link
                    href={`/admin/products/${product.slug}`}
                    className="inline-flex items-center justify-center rounded-full border border-olive/14 bg-white px-4 py-2 text-sm font-semibold text-olive-dark hover:bg-olive-soft/36"
                  >
                    Editar
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="bg-white/92 px-5 py-8 text-center text-sm text-foreground/66">
              No encontramos productos con esa búsqueda.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}
