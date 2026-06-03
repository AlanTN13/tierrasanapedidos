import productsData from "@/data/products.json";
import { Storefront } from "@/components/storefront";
import { getCategories } from "@/lib/catalog";
import { getHomeContent } from "@/lib/home";
import type { Product } from "@/types/catalog";

const products = productsData as Product[];
const availableCategories = getCategories(products);
const homeContent = getHomeContent(products);

type HomeProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const resolvedSearchParams = await searchParams;
  const initialSearchQuery = resolvedSearchParams?.q?.trim() ?? "";

  return (
    <Storefront
      products={products}
      availableCategories={availableCategories}
      homeContent={homeContent}
      initialSearchQuery={initialSearchQuery}
    />
  );
}
