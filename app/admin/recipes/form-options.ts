import "server-only";

import { getAdminCategories, getAdminProducts, getAvailableCategories } from "@/lib/catalog-data";

export async function getRecipeCategoryOptions() {
  return getAvailableCategories();
}

export async function getRecipeProductOptions() {
  const [products, categories] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
  ]);
  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));

  return products
    .map((product) => ({
      id: product.uuid,
      label: product.name,
      categoryLabel:
        product.categoryIds
          .map((categoryId) => categoryNameById.get(categoryId))
          .filter((value): value is string => Boolean(value))
          .join(", ") || "Sin categoría",
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));
}
