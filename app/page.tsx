import { Suspense } from "react";
import { Storefront } from "@/components/storefront";
import {
  getAvailableCategories,
  getCatalogProducts,
  getCategoryCards,
} from "@/lib/catalog-data";
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
  const homeContent = getHomeContent(products, categoryCards);

  return (
    <Storefront
      products={products}
      availableCategories={availableCategories}
      homeContent={homeContent}
      initialSearchQuery={initialSearchQuery}
    />
  );
}
