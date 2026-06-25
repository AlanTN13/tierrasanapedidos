import "server-only";

import { getAvailableCategories, getCatalogProducts } from "@/lib/catalog-data";

export async function getRecipeCategoryOptions() {
  return getAvailableCategories();
}

export async function getRecipeProductOptions() {
  const products = await getCatalogProducts();

  return products
    .map((product) => ({
      id: product.id,
      label: product.nombre,
      categoryLabel: product.categorias?.[0] ?? product.categoria ?? "Sin categoría",
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));
}
