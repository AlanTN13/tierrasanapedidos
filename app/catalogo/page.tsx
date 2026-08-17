import { Suspense } from "react";
import { CatalogListingStorefront } from "@/components/catalog-listing-storefront";
import {
  getCatalogCategories,
  getCatalogProducts,
} from "@/lib/catalog-data";
import { filterProducts } from "@/lib/catalog";

type CatalogPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export const metadata = {
  title: "Catálogo · Tierra Sana",
  description: "Buscá productos en el catálogo de Tierra Sana.",
};

export default function CatalogPage({ searchParams }: CatalogPageProps) {
  return (
    <Suspense fallback={<CatalogFallback />}>
      <CatalogContent searchParams={searchParams} />
    </Suspense>
  );
}

async function CatalogContent({ searchParams }: CatalogPageProps) {
  const [{ q }, products, categories] = await Promise.all([
    searchParams,
    getCatalogProducts(),
    getCatalogCategories(),
  ]);
  const query = q?.trim() ?? "";
  const visibleProducts = query
    ? filterProducts(products, categories[0]?.name ?? "", query)
    : products;
  const title = query ? `Resultados para “${query}”` : "Catálogo";

  return (
    <CatalogListingStorefront
      title={title}
      products={visibleProducts}
      categories={categories}
      activeCategory={null}
      backHref="/"
      backLabel="Inicio"
      initialSearchQuery={query}
      emptyMessage="No encontramos productos para esa búsqueda."
    />
  );
}

function CatalogFallback() {
  return (
    <main className="container-shell py-12" aria-busy="true">
      <p className="text-sm font-semibold text-olive-dark">
        Cargando catálogo…
      </p>
    </main>
  );
}
