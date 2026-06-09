import { Suspense } from "react";
import { Storefront } from "@/components/storefront";
import {
  getAvailableCategories,
  getCatalogProducts,
  getCategoryCards,
} from "@/lib/catalog-data";
import { filterProducts } from "@/lib/catalog";
import { getHomeContent } from "@/lib/home";

type HomeProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  return (
    <Suspense fallback={null}>
      <HomeContent searchParams={searchParams} />
    </Suspense>
  );
}

async function HomeContent({ searchParams }: HomeProps) {
  const resolvedSearchParams = await searchParams;
  const initialSearchQuery = resolvedSearchParams?.q?.trim() ?? "";
  const [products, availableCategories, categoryCards] = await Promise.all([
    getCatalogProducts(),
    getAvailableCategories(),
    getCategoryCards(),
  ]);
  const initialCategory = availableCategories[0] ?? "Destacados";
  const shouldDeferFullCatalog = initialSearchQuery.length === 0;
  const initialProducts = shouldDeferFullCatalog
    ? filterProducts(products, initialCategory, "")
    : products;
  const homeContent = getHomeContent(categoryCards);

  return (
    <Storefront
      initialProducts={initialProducts}
      availableCategories={availableCategories}
      homeContent={homeContent}
      initialCategory={initialCategory}
      initialSearchQuery={initialSearchQuery}
      catalogUrl={shouldDeferFullCatalog ? "/api/catalog" : null}
      hasCompleteCatalog={!shouldDeferFullCatalog}
    />
  );
}
