import type { FilterCategory, Product } from "@/types/catalog";

export const categories: FilterCategory[] = [
  "Todos",
  "Frutos secos",
  "Semillas",
  "Harinas",
  "Cereales",
  "Snacks saludables",
  "Suplementos",
  "Sin TACC",
  "Ofertas",
];

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
