import type { FilterCategory, Product } from "@/types/catalog";

const CATEGORY_ORDER = [
  "Frutos secos y snacks",
  "Semillas",
  "Harinas",
  "Legumbres",
  "Arroces",
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

  return ["Destacados", ...sortedCategories];
}

export function filterProducts(
  products: Product[],
  activeCategory: FilterCategory,
  rawQuery: string,
) {
  const query = normalizeSearchText(rawQuery);

  const categoryFilteredProducts = products.filter((product) => {
    return activeCategory === "Destacados"
      ? product.destacado
      : product.categoria === activeCategory;
  });

  if (!query) {
    return categoryFilteredProducts;
  }

  return categoryFilteredProducts
    .map((product) => ({
      product,
      score: getProductSearchScore(product, query),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.product.nombre.localeCompare(b.product.nombre, "es"))
    .map((entry) => entry.product);
}

function getProductSearchScore(product: Product, query: string) {
  const normalizedName = normalizeSearchText(product.nombre);
  const normalizedCategory = normalizeSearchText(product.categoria);
  const normalizedDescription = normalizeSearchText(product.descripcion);
  const normalizedTags = getProductSearchTags(product);
  const normalizedPresentations = product.presentaciones.map((presentation) =>
    normalizeSearchText(presentation.etiqueta),
  );
  const searchableChunks = [
    normalizedName,
    normalizedCategory,
    normalizedDescription,
    ...normalizedTags,
    ...normalizedPresentations,
  ];

  if (normalizedName === query) {
    return 1000;
  }

  if (normalizedName.startsWith(query)) {
    return 850;
  }

  if (normalizedName.includes(query)) {
    return 700;
  }

  if (hasTokenPrefixMatch(normalizedName, query)) {
    return 620;
  }

  if (normalizedCategory === query) {
    return 540;
  }

  if (normalizedCategory.includes(query)) {
    return 460;
  }

  if (normalizedTags.some((tag) => tag === query)) {
    return 380;
  }

  if (normalizedTags.some((tag) => tag.includes(query))) {
    return 320;
  }

  if (normalizedPresentations.some((presentation) => presentation === query)) {
    return 260;
  }

  if (normalizedPresentations.some((presentation) => presentation.includes(query))) {
    return 220;
  }

  if (normalizedDescription.includes(query)) {
    return 180;
  }

  if (searchableChunks.some((chunk) => chunk.includes(query))) {
    return 120;
  }

  if (hasLooseTokenMatch(searchableChunks, query)) {
    return 80;
  }

  return 0;
}

function getProductSearchTags(product: Product) {
  const categoryTags: Partial<Record<Product["categoria"], string[]>> = {
    "Frutos secos y snacks": ["snack", "colacion", "picada", "saludable"],
    Semillas: ["desayuno", "saludable", "topping"],
    Harinas: ["cocina", "recetas", "panificados"],
    Legumbres: ["saludable", "cocina", "almuerzo"],
    Arroces: ["cocina", "guarnicion", "sushi"],
    Cereales: ["desayuno", "merienda", "saludable"],
    Especias: ["condimentos", "cocina", "sabor"],
    Reposteria: ["reposteria", "postres", "horneados"],
    Aceites: ["cocina", "ensaladas", "saludable"],
    "Dulces & Untables": ["desayuno", "merienda", "untables"],
  };

  const tags = new Set([
    ...(product.tags ?? []),
    ...(categoryTags[product.categoria] ?? []),
  ]);

  return [...tags].map((tag) => normalizeSearchText(tag));
}

function hasTokenPrefixMatch(normalizedText: string, query: string) {
  return normalizedText.split(" ").some((token) => token.startsWith(query));
}

function hasLooseTokenMatch(chunks: string[], query: string) {
  const queryTokens = query.split(" ").filter(Boolean);

  if (queryTokens.length < 2) {
    return false;
  }

  return queryTokens.every((token) =>
    chunks.some((chunk) => chunk.includes(token)),
  );
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export { normalizeSearchText };
