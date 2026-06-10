import type { FilterCategory, Product } from "@/types/catalog";

export const CATEGORY_CONFIG = [
  {
    category: "Frutos secos y snack",
    title: "Frutos secos y snack",
    image: "/categorias-optimized/frutos-secos-y-snack.webp",
    searchTags: ["frutos secos", "snack", "colacion", "mix"],
  },
  {
    category: "Semillas",
    title: "Semillas",
    image: "/categorias-optimized/semillas.webp",
    searchTags: ["semillas", "topping", "desayuno"],
  },
  {
    category: "Harinas y premezclas",
    title: "Harinas y premezclas",
    image: "/categorias-optimized/harinas-y-premezclas.webp",
    searchTags: ["harinas", "premezclas", "panificados"],
  },
  {
    category: "Sin TACC",
    title: "Sin TACC",
    image: "/categorias-optimized/sin-tacc.webp",
    searchTags: ["sin tacc", "celiacos", "gluten free"],
  },
  {
    category: "Cereales y granolas",
    title: "Cereales y granolas",
    image: "/categorias-optimized/cereales-y-granolas.webp",
    searchTags: ["cereales", "granolas", "desayuno", "merienda"],
  },
  {
    category: "Sin azucar",
    title: "Sin azucar",
    image: "/categorias-optimized/sin-azucar.webp",
    searchTags: ["sin azucar", "light"],
  },
  {
    category: "Dulces y untables",
    title: "Dulces y untables",
    image: "/categorias-optimized/dulces-y-untables.webp",
    searchTags: ["dulces", "untables", "mermeladas", "miel", "pasta de mani"],
  },
  {
    category: "Legumbres",
    title: "Legumbres",
    image: "/categorias-optimized/legumbres.webp",
    searchTags: ["legumbres", "porotos", "garbanzos", "lentejas"],
  },
  {
    category: "Arroces y oriental",
    title: "Arroces y oriental",
    image: "/categorias-optimized/arroces-y-oriental.webp",
    searchTags: ["arroz", "oriental", "sushi", "papel de arroz"],
  },
  {
    category: "Condimentos y especias",
    title: "Condimentos y especias",
    image: "/categorias-optimized/condimentos-y-especias.webp",
    searchTags: ["condimentos", "especias", "sabor", "cocina"],
  },
  {
    category: "Galletitas",
    title: "Galletitas",
    image: "/categorias-optimized/galletitas.webp",
    searchTags: ["galletitas", "cookies", "snack"],
  },
  {
    category: "Reposteria y endulzantes",
    title: "Reposteria y endulzantes",
    image: "/categorias-optimized/reposteria.webp",
    searchTags: ["reposteria", "hornear", "postres", "dulce", "endulzantes", "azucar", "stevia"],
  },
  {
    category: "Aceites y salsas de soja",
    title: "Aceites y salsas de soja",
    image: "/categorias-optimized/aceites-y-salsas-de-soja.webp",
    searchTags: ["aceites", "salsas", "soja", "cocina", "aderezos"],
  },
] as const;

const CATEGORY_ORDER = CATEGORY_CONFIG.map((entry) => entry.category);

const LEGACY_TO_FINAL_CATEGORY_MAP: Record<string, string[]> = {
  Aceites: ["Aceites y salsas de soja"],
  "Arroz y Gourmet": ["Arroces y oriental"],
  Cereales: ["Cereales y granolas"],
  "Dulces & Untables": ["Dulces y untables"],
  Especias: ["Condimentos y especias"],
  "Frutos secos y snacks": ["Frutos secos y snack"],
  Galletitas: ["Galletitas"],
  Harinas: ["Harinas y premezclas"],
  Legumbres: ["Legumbres"],
  Reposteria: ["Reposteria y endulzantes"],
  Semillas: ["Semillas"],
};

const PRODUCT_EXTRA_CATEGORIES: Record<string, string[]> = {
  almendra: ["Sin azucar", "Sin TACC"],
  "arroz-koshihikari-sushi": ["Sin TACC"],
  "arroz-yamani-integral": ["Sin TACC"],
  "avena-instantanea": ["Sin azucar"],
  "avena-tradicional": ["Sin azucar"],
  "arroz-inflado": ["Sin azucar", "Sin TACC"],
  "cacao-amargo-alcalino": ["Sin azucar", "Sin TACC"],
  "canela-en-polvo": ["Reposteria y endulzantes"],
  "castanas-de-caju": ["Sin azucar", "Sin TACC"],
  "chia-premium": ["Sin azucar", "Sin TACC"],
  "coco-rallado": ["Sin azucar", "Sin TACC"],
  "fecula-de-mandioca": ["Sin TACC"],
  "galletas-de-arroz-con-sal": ["Sin TACC"],
  "galletas-de-arroz-dulces": ["Sin TACC"],
  "galletas-de-arroz-sin-sal": ["Sin TACC"],
  girasol: ["Sin azucar", "Sin TACC"],
  garbanzos: ["Sin TACC"],
  "harina-de-almendras": ["Reposteria y endulzantes", "Sin azucar", "Sin TACC"],
  "harina-de-arroz": ["Sin azucar", "Sin TACC"],
  "harina-de-coco": ["Sin azucar", "Sin TACC"],
  "harina-integral": ["Sin azucar", "Sin TACC"],
  lino: ["Sin azucar", "Sin TACC"],
  lentejas: ["Sin TACC"],
  "maiz-inflado": ["Sin azucar", "Sin TACC"],
  "mix-con-avellanas": ["Sin azucar", "Sin TACC"],
  "mix-de-semillas": ["Sin azucar", "Sin TACC"],
  "nuez-mariposa": ["Sin azucar", "Sin TACC"],
  "pasta-mani-beepure": ["Sin azucar"],
  "pistachos-pelados": ["Sin azucar", "Sin TACC"],
  "porotos-de-alubia": ["Sin TACC"],
  "porotos-negros": ["Sin TACC"],
  "premezcla-bizcochuelo-chocolate-dona-pacha": ["Sin TACC"],
  "premezcla-bizcochuelo-vainilla-dona-pacha": ["Sin TACC"],
  "premezcla-brownie-dona-pacha": ["Sin TACC"],
  "quinoa-inflada": ["Sin azucar", "Sin TACC"],
  "stevia-hileret-50-sobres": ["Sin azucar"],
  "stevia-hileret-liquido-200cc": ["Sin azucar"],
  "zucra-hileret-liquido-200cc": ["Sin azucar"],
};

const FEATURED_PRODUCT_ORDER = [
  "mix-con-avellanas",
  "chia-premium",
  "granola-tropical",
  "harina-de-almendras",
  "pasta-mani-entrenuts-caramel",
  "pistachos-con-cascara",
] as const;

export function getCategories(products: Product[]): FilterCategory[] {
  void products;
  return [...CATEGORY_ORDER];
}

export function getResolvedProductCategories(product: Product) {
  const sourceCategories =
    product.categorias && product.categorias.length > 0
      ? product.categorias
      : [
          ...(LEGACY_TO_FINAL_CATEGORY_MAP[product.categoria] ?? [product.categoria]),
          ...(PRODUCT_EXTRA_CATEGORIES[product.id] ?? []),
        ];

  return [...new Set(sourceCategories)].filter(Boolean);
}

export function getPrimaryCategory(product: Product) {
  return getResolvedProductCategories(product)[0] ?? product.categoria;
}

export function filterProducts(
  products: Product[],
  activeCategory: FilterCategory,
  rawQuery: string,
) {
  const query = normalizeSearchText(rawQuery);

  const categoryFilteredProducts =
    products.filter((product) =>
      getResolvedProductCategories(product).includes(activeCategory),
    );

  const searchableProducts = query ? products : categoryFilteredProducts;

  if (!query) {
    return categoryFilteredProducts;
  }

  return searchableProducts
    .map((product) => ({
      product,
      score: getProductSearchScore(product, query),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.product.nombre.localeCompare(b.product.nombre, "es"))
    .map((entry) => entry.product);
}

export function getFeaturedProducts(products: Product[]) {
  const featuredProducts = products.filter((product) => product.destacado);

  return featuredProducts.sort((a, b) => {
    const aOrder = a.featuredOrder ?? Number.MAX_SAFE_INTEGER;
    const bOrder = b.featuredOrder ?? Number.MAX_SAFE_INTEGER;

    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }

    const aIndex = FEATURED_PRODUCT_ORDER.indexOf(a.id as (typeof FEATURED_PRODUCT_ORDER)[number]);
    const bIndex = FEATURED_PRODUCT_ORDER.indexOf(b.id as (typeof FEATURED_PRODUCT_ORDER)[number]);

    if (aIndex === -1 && bIndex === -1) {
      return a.nombre.localeCompare(b.nombre, "es");
    }

    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;

    return aIndex - bIndex;
  });
}

function getProductSearchScore(product: Product, query: string) {
  const normalizedName = normalizeSearchText(product.nombre);
  const normalizedCategories = getResolvedProductCategories(product).map(normalizeSearchText);
  const normalizedDescription = normalizeSearchText(product.descripcion);
  const normalizedTags = getProductSearchTags(product);
  const normalizedPresentations = product.presentaciones.map((presentation) =>
    normalizeSearchText(presentation.etiqueta),
  );
  const searchableChunks = [
    normalizedName,
    ...normalizedCategories,
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

  if (normalizedCategories.some((category) => category === query)) {
    return 540;
  }

  if (normalizedCategories.some((category) => category.includes(query))) {
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
  const categoryTags = new Set<string>();

  for (const category of getResolvedProductCategories(product)) {
    const config = CATEGORY_CONFIG.find((entry) => entry.category === category);

    for (const tag of config?.searchTags ?? []) {
      categoryTags.add(tag);
    }
  }

  const tags = new Set([...(product.tags ?? []), ...categoryTags]);

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

export { CATEGORY_ORDER, normalizeSearchText };
