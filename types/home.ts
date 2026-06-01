import type { Product, ProductCategory } from "@/types/catalog";

export type HomeSectionLink = {
  id: string;
  label: string;
};

export type HomeHeroConfig = {
  eyebrow: string;
  title: string;
  description: string;
  searchPlaceholder: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  heroSteps: {
    number: string;
    label: string;
  }[];
  heroVisualItems: {
    image: string;
    title: string;
    detail: string;
    tone: "olive" | "sand" | "cream";
    size: "feature" | "portrait" | "compact";
  }[];
};
export type ResolvedHomeHeroConfig = HomeHeroConfig;

export type HomeCategoryCard = {
  category: ProductCategory;
  title: string;
  image: string;
};

export type HomeFeaturedShelf = {
  title: string;
  description: string;
  products: Product[];
};

export type RecipeHighlight = {
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  heroImage: string;
  targetCategory: ProductCategory;
  prepLabel: string;
  servingsLabel: string;
  ingredients: string[];
  steps: string[];
  productIds: string[];
};

export type ResolvedRecipeHighlight = Omit<RecipeHighlight, "productIds"> & {
  products: Product[];
};

export type HomeContent = {
  sectionLinks: HomeSectionLink[];
  hero: ResolvedHomeHeroConfig;
  categoryCards: HomeCategoryCard[];
  featuredShelf: HomeFeaturedShelf;
  recipeHighlights: ResolvedRecipeHighlight[];
};
