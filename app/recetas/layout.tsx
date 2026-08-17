import { RecipesStorefrontShell } from "@/components/recipes-storefront-shell";
import { getCatalogCategories } from "@/lib/catalog-data";

export default async function RecipesLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCatalogCategories();
  return <RecipesStorefrontShell categories={categories}>{children}</RecipesStorefrontShell>;
}
