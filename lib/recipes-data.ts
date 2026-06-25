import "server-only";

import { cacheTag, revalidateTag } from "next/cache";
import { createClient as createPublicClient } from "@supabase/supabase-js";
import { getCatalogProducts, getAdminProducts } from "@/lib/catalog-data";
import { getRecipeHighlights as getFallbackRecipeHighlights } from "@/lib/home";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/config";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { Product } from "@/types/catalog";
import type { Database } from "@/types/database";
import type { HomeRecipeHighlight, ResolvedRecipeHighlight } from "@/types/home";

type RecipeRow = Database["public"]["Tables"]["recipes"]["Row"];
type RecipeProductRow = Database["public"]["Tables"]["recipe_products"]["Row"];

export type AdminRecipeRecord = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  heroImagePath: string;
  targetCategory: string;
  prepLabel: string;
  servingsLabel: string;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
};

export type AdminRecipe = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  heroImagePath: string;
  targetCategory: string;
  prepLabel: string;
  servingsLabel: string;
  ingredients: string[];
  steps: string[];
  sortOrder: number;
  isActive: boolean;
  productIds: string[];
};

function isMissingRelationError(message: string) {
  const normalized = message.toLowerCase();

  return (
    normalized.includes("schema cache") ||
    normalized.includes("could not find the table") ||
    normalized.includes("does not exist") ||
    normalized.includes("could not find the relation")
  );
}

function createSupabaseClient() {
  const { url, publishableKey } = getSupabaseEnv();
  return createPublicClient<Database>(url, publishableKey);
}

function normalizeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getRecipeRows(includeInactive: boolean) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = includeInactive ? createServiceRoleClient() : createSupabaseClient();
  const query = supabase
    .from("recipes")
    .select(
      "id, slug, title, short_description, long_description, hero_image_path, target_category, prep_label, servings_label, ingredients, steps, sort_order, is_active, created_at, updated_at",
    )
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  const { data, error } = await query;

  if (error && isMissingRelationError(error.message)) {
    return null;
  }

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as RecipeRow[];
}

async function getRecipeProductRows(includeInactive: boolean) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = includeInactive ? createServiceRoleClient() : createSupabaseClient();
  const { data, error } = await supabase
    .from("recipe_products")
    .select("recipe_id, product_id, sort_order, created_at")
    .order("sort_order", { ascending: true });

  if (error && isMissingRelationError(error.message)) {
    return null;
  }

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as RecipeProductRow[];
}

function mapHomeRecipeHighlight(recipe: ResolvedRecipeHighlight): HomeRecipeHighlight {
  const { products, ...recipeHighlight } = recipe;
  void products;
  return recipeHighlight;
}

function resolveRecipeRows(
  recipeRows: RecipeRow[],
  recipeProductRows: RecipeProductRow[],
  products: Product[],
) {
  const fallbackRecipesBySlug = new Map(
    getFallbackRecipeHighlights(products).map((recipe) => [recipe.slug, recipe]),
  );
  const productById = new Map(products.map((product) => [product.id, product]));
  const productIdsByRecipeId = new Map<string, string[]>();

  for (const relation of recipeProductRows) {
    const list = productIdsByRecipeId.get(relation.recipe_id) ?? [];
    list.push(relation.product_id);
    productIdsByRecipeId.set(relation.recipe_id, list);
  }

  return recipeRows.map((recipeRow) => {
    const fallbackRecipe = fallbackRecipesBySlug.get(recipeRow.slug);
    const productIds = productIdsByRecipeId.get(recipeRow.id) ?? [];

    return {
      slug: recipeRow.slug,
      title: recipeRow.title,
      shortDescription: recipeRow.short_description,
      longDescription: recipeRow.long_description,
      heroImage: recipeRow.hero_image_path || fallbackRecipe?.heroImage || "/recetas/trufas-fit.webp",
      targetCategory: recipeRow.target_category,
      prepLabel: recipeRow.prep_label,
      servingsLabel: recipeRow.servings_label,
      ingredients: recipeRow.ingredients ?? [],
      steps: recipeRow.steps ?? [],
      products: productIds
        .map((productId) => productById.get(productId))
        .filter((product): product is Product => Boolean(product)),
    } satisfies ResolvedRecipeHighlight;
  });
}

async function getFallbackResolvedRecipes() {
  const products = await getCatalogProducts();
  return getFallbackRecipeHighlights(products);
}

export async function getResolvedRecipes(): Promise<ResolvedRecipeHighlight[]> {
  "use cache";

  cacheTag("recipes");
  cacheTag("catalog");

  const [recipeRows, recipeProductRows, products] = await Promise.all([
    getRecipeRows(false),
    getRecipeProductRows(false),
    getCatalogProducts(),
  ]);

  if (!recipeRows || !recipeProductRows) {
    return getFallbackRecipeHighlights(products);
  }

  return resolveRecipeRows(recipeRows, recipeProductRows, products);
}

export async function getResolvedRecipeBySlug(slug: string) {
  const recipes = await getResolvedRecipes();
  return recipes.find((recipe) => recipe.slug === slug) ?? null;
}

export async function getHomeRecipeHighlights() {
  const recipes = await getResolvedRecipes();
  return recipes.map(mapHomeRecipeHighlight);
}

export async function getAdminRecipeRecords(): Promise<AdminRecipeRecord[]> {
  const [recipeRows, recipeProductRows] = await Promise.all([
    getRecipeRows(true),
    getRecipeProductRows(true),
  ]);

  if (!recipeRows || !recipeProductRows) {
    return (await getFallbackResolvedRecipes()).map((recipe, index) => ({
      id: recipe.slug,
      slug: recipe.slug,
      title: recipe.title,
      shortDescription: recipe.shortDescription,
      heroImagePath: recipe.heroImage,
      targetCategory: recipe.targetCategory,
      prepLabel: recipe.prepLabel,
      servingsLabel: recipe.servingsLabel,
      sortOrder: index,
      isActive: true,
      productCount: recipe.products.length,
    }));
  }

  const productCountByRecipeId = new Map<string, number>();

  for (const relation of recipeProductRows) {
    productCountByRecipeId.set(
      relation.recipe_id,
      (productCountByRecipeId.get(relation.recipe_id) ?? 0) + 1,
    );
  }

  return recipeRows.map((recipe) => ({
    id: recipe.id,
    slug: recipe.slug,
    title: recipe.title,
    shortDescription: recipe.short_description,
    heroImagePath: recipe.hero_image_path,
    targetCategory: recipe.target_category,
    prepLabel: recipe.prep_label,
    servingsLabel: recipe.servings_label,
    sortOrder: recipe.sort_order,
    isActive: recipe.is_active,
    productCount: productCountByRecipeId.get(recipe.id) ?? 0,
  }));
}

export async function getAdminRecipeBySlug(slug: string): Promise<AdminRecipe | null> {
  const [recipeRows, recipeProductRows] = await Promise.all([
    getRecipeRows(true),
    getRecipeProductRows(true),
  ]);

  if (!recipeRows || !recipeProductRows) {
    const recipe = (await getFallbackResolvedRecipes()).find((entry) => entry.slug === slug);

    if (!recipe) {
      return null;
    }

    return {
      id: recipe.slug,
      slug: recipe.slug,
      title: recipe.title,
      shortDescription: recipe.shortDescription,
      longDescription: recipe.longDescription,
      heroImagePath: recipe.heroImage,
      targetCategory: recipe.targetCategory,
      prepLabel: recipe.prepLabel,
      servingsLabel: recipe.servingsLabel,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      sortOrder: 0,
      isActive: true,
      productIds: recipe.products.map((product) => product.id),
    };
  }

  const normalizedSlug = normalizeSlug(slug);
  const recipe = recipeRows.find((entry) => {
    const entrySlug = normalizeSlug(entry.slug);

    return entry.slug === slug || entrySlug === normalizedSlug;
  });

  if (!recipe) {
    return null;
  }

  return {
    id: recipe.id,
    slug: recipe.slug,
    title: recipe.title,
    shortDescription: recipe.short_description,
    longDescription: recipe.long_description,
    heroImagePath: recipe.hero_image_path,
    targetCategory: recipe.target_category,
    prepLabel: recipe.prep_label,
    servingsLabel: recipe.servings_label,
    ingredients: recipe.ingredients ?? [],
    steps: recipe.steps ?? [],
    sortOrder: recipe.sort_order,
    isActive: recipe.is_active,
    productIds: recipeProductRows
      .filter((entry) => entry.recipe_id === recipe.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((entry) => entry.product_id),
  };
}

export async function getRecipeProductOptions() {
  const products = await getAdminProducts();

  return products
    .filter((product) => product.isActive)
    .map((product) => ({
      id: product.uuid,
      label: product.name,
      categoryLabel: product.categoryIds[0] ?? "Sin categoría",
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));
}

export async function refreshRecipesCache() {
  revalidateTag("recipes", "max");
  revalidateTag("home", "max");
}
