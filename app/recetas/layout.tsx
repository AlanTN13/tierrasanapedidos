import { RecipesStorefrontShell } from "@/components/recipes-storefront-shell";
import { getAvailableCategories } from "@/lib/catalog-data";

export default async function RecipesLayout({ children }: { children: React.ReactNode }) {
  const categories = await getAvailableCategories();
  return <RecipesStorefrontShell categories={categories}>{children}</RecipesStorefrontShell>;
}
