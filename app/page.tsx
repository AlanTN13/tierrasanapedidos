import productsData from "@/data/products.json";
import { Storefront } from "@/components/storefront";
import type { Product } from "@/types/catalog";

const products = productsData as Product[];

export default function Home() {
  return <Storefront products={products} />;
}
