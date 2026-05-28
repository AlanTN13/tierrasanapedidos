import productsData from "@/data/products.json";
import { Storefront } from "@/components/storefront";
import type { Product } from "@/types/catalog";

const products = productsData as Product[];

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
      initialSearchQuery={initialSearchQuery}
    />
  );
}
