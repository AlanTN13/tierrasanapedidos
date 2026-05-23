import type { FilterCategory, Product } from "@/types/catalog";

const CATEGORY_ORDER = [
  "Frutos secos y snaks",
  "Semillas",
  "Harinas",
  "Legumbres",
  "Cereales",
  "Especias",
  "Reposteria",
  "Aceites",
  "Dulces & Untables",
] as const;

export function getCategories(products: Product[]): FilterCategory[] {
  const uniqueCategories = [...new Set(products.map((product) => product.categoria))];

  const sortedCategories = uniqueCategories.sort((a, b) => {
    const aIndex = CATEGORY_ORDER.indexOf(a as (typeof CATEGORY_ORDER)[number]);
    const bIndex = CATEGORY_ORDER.indexOf(b as (typeof CATEGORY_ORDER)[number]);

    if (aIndex === -1 && bIndex === -1) {
      return a.localeCompare(b, "es");
    }

    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;

    return aIndex - bIndex;
  });

  return ["Todos", ...sortedCategories];
}

export function filterProducts(
  products: Product[],
  activeCategory: FilterCategory,
  rawQuery: string,
) {
  const query = rawQuery.trim().toLowerCase();

  return products.filter((product) => {
    const matchesCategory =
      activeCategory === "Todos" || product.categoria === activeCategory;

    const haystack = [
      product.nombre,
      product.categoria,
      product.descripcion,
      ...product.presentaciones.map((presentation) => presentation.etiqueta),
    ]
      .join(" ")
      .toLowerCase();

    const matchesQuery = query.length === 0 || haystack.includes(query);

    return matchesCategory && matchesQuery;
  });
}
