import "server-only";

import { cacheTag, revalidateTag } from "next/cache";
import { createClient as createPublicClient, type SupabaseClient } from "@supabase/supabase-js";
import productsData from "@/data/products.json";
import {
  CATEGORY_CONFIG,
  CATEGORY_ORDER,
  getResolvedProductCategories,
} from "@/lib/catalog";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/config";
import type { Database } from "@/types/database";
import type { CatalogCategory, Product, ProductPresentation } from "@/types/catalog";

type ProductRow = Pick<
  Database["public"]["Tables"]["products"]["Row"],
  | "id"
  | "slug"
  | "name"
  | "description"
  | "image_path"
  | "tags"
  | "is_featured"
  | "featured_order"
  | "is_active"
>;
type CategoryRow = Pick<
  Database["public"]["Tables"]["categories"]["Row"],
  "id" | "slug" | "name" | "image_path" | "search_tags" | "sort_order" | "is_active"
>;
type ProductPresentationRow = Pick<
  Database["public"]["Tables"]["product_presentations"]["Row"],
  "id" | "product_id" | "label" | "price_cents" | "sort_order" | "is_active"
>;
type ProductCategoryRow = Pick<
  Database["public"]["Tables"]["product_categories"]["Row"],
  "product_id" | "category_id" | "sort_order"
>;

export type AdminCatalogProduct = {
  uuid: string;
  slug: string;
  name: string;
  description: string;
  imagePath: string;
  tags: string[];
  isFeatured: boolean;
  featuredOrder: number | null;
  isActive: boolean;
  categoryIds: string[];
  presentations: ProductPresentation[];
};

type CatalogSnapshot = {
  categories: CatalogCategory[];
  products: Product[];
};

const fallbackProducts = productsData as Product[];

function fallbackCategories(): CatalogCategory[] {
  return CATEGORY_CONFIG.map((entry, index) => ({
    id: entry.category,
    slug: slugify(entry.category),
    name: entry.category,
    image: entry.image,
    searchTags: [...entry.searchTags],
    sortOrder: index,
    isActive: true,
  }));
}

function createSupabasePublicClient() {
  const { url, publishableKey } = getSupabaseEnv();
  return createPublicClient<Database>(url, publishableKey);
}

function bySortOrder<T extends { sortOrder: number }>(a: T, b: T) {
  return a.sortOrder - b.sortOrder;
}

async function fetchCatalogRows(
  supabase: SupabaseClient<Database>,
  includeInactive: boolean,
) {
  const categoriesPromise = supabase
    .from("categories")
    .select("id, slug, name, image_path, search_tags, sort_order, is_active")
    .order("sort_order", { ascending: true });

  let productsQuery = supabase
    .from("products")
    .select(
      "id, slug, name, description, image_path, tags, is_featured, featured_order, is_active",
    )
    .order("name", { ascending: true });

  if (!includeInactive) {
    productsQuery = productsQuery.eq("is_active", true);
  }

  let presentationsQuery = supabase
    .from("product_presentations")
    .select("id, product_id, label, price_cents, sort_order, is_active")
    .order("sort_order", { ascending: true });

  if (!includeInactive) {
    presentationsQuery = presentationsQuery.eq("is_active", true);
  }

  const productCategoriesQuery = supabase
    .from("product_categories")
    .select("product_id, category_id, sort_order")
    .order("sort_order", { ascending: true });

  const [categoriesResult, productsResult, presentationsResult, productCategoriesResult] =
    await Promise.all([
      categoriesPromise,
      productsQuery,
      presentationsQuery,
      productCategoriesQuery,
    ]);

  return {
    categoriesResult,
    productsResult,
    presentationsResult,
    productCategoriesResult,
  };
}

function mapCatalogCategory(row: CategoryRow): CatalogCategory {
  const fallback = CATEGORY_CONFIG.find(
    (entry) => slugify(entry.category) === row.slug || entry.category === row.name,
  );

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    image: row.image_path ?? fallback?.image ?? "/categorias-optimized/semillas.jpg",
    searchTags: row.search_tags ?? [...(fallback?.searchTags ?? [])],
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

function mapProductPresentation(row: ProductPresentationRow): ProductPresentation {
  return {
    id: row.id,
    etiqueta: row.label,
    precio: row.price_cents / 100,
    sortOrder: row.sort_order,
    activa: row.is_active,
  };
}

function mapProductRowsToCatalog(
  productRows: ProductRow[],
  categoryRows: CategoryRow[],
  presentationRows: ProductPresentationRow[],
  productCategoryRows: ProductCategoryRow[],
) {
  const categories = categoryRows.map(mapCatalogCategory).sort(bySortOrder);
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const presentationsByProductId = new Map<string, ProductPresentation[]>();
  const categoryAssignmentsByProductId = new Map<
    string,
    { categoryId: string; sortOrder: number }[]
  >();

  for (const presentationRow of presentationRows) {
    const list = presentationsByProductId.get(presentationRow.product_id) ?? [];
    list.push(mapProductPresentation(presentationRow));
    presentationsByProductId.set(presentationRow.product_id, list);
  }

  for (const assignment of productCategoryRows) {
    const list = categoryAssignmentsByProductId.get(assignment.product_id) ?? [];
    list.push({
      categoryId: assignment.category_id,
      sortOrder: assignment.sort_order,
    });
    categoryAssignmentsByProductId.set(assignment.product_id, list);
  }

  const products = productRows.map((row) => {
    const presentations = (presentationsByProductId.get(row.id) ?? []).sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    );
    const categoryAssignments = (categoryAssignmentsByProductId.get(row.id) ?? [])
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((assignment) => categoryById.get(assignment.categoryId))
      .filter((category): category is CatalogCategory => Boolean(category));
    const categorias = categoryAssignments.map((category) => category.name);

    return {
      id: row.slug,
      nombre: row.name,
      categoria: categorias[0] ?? "Sin categoria",
      categorias,
      descripcion: row.description,
      tags: row.tags ?? [],
      presentaciones: presentations,
      imagen: row.image_path ?? "/productos/frutos-secos-placeholder.svg",
      destacado: row.is_featured,
      featuredOrder: row.featured_order,
    } satisfies Product;
  });

  return {
    categories,
    products,
  };
}

async function getCachedCatalogSnapshot(): Promise<CatalogSnapshot> {
  "use cache";

  cacheTag("catalog");

  if (!isSupabaseConfigured()) {
    return {
      categories: fallbackCategories(),
      products: fallbackProducts,
    };
  }

  try {
    const supabase = createSupabasePublicClient();
    const {
      categoriesResult,
      productsResult,
      presentationsResult,
      productCategoriesResult,
    } = await fetchCatalogRows(supabase, false);

    if (
      categoriesResult.error ||
      productsResult.error ||
      presentationsResult.error ||
      productCategoriesResult.error
    ) {
      throw new Error(
        [
          categoriesResult.error?.message,
          productsResult.error?.message,
          presentationsResult.error?.message,
          productCategoriesResult.error?.message,
        ]
          .filter(Boolean)
          .join(" | "),
      );
    }

    return mapProductRowsToCatalog(
      productsResult.data ?? [],
      (categoriesResult.data ?? []).filter((category) => category.is_active),
      presentationsResult.data ?? [],
      productCategoriesResult.data ?? [],
    );
  } catch (error) {
    console.error("Fallo la lectura del catálogo en Supabase, se usa fallback local.", error);

    return {
      categories: fallbackCategories(),
      products: fallbackProducts,
    };
  }
}

export async function getCatalogProducts() {
  const snapshot = await getCachedCatalogSnapshot();
  return snapshot.products;
}

export async function getAvailableCategories() {
  const snapshot = await getCachedCatalogSnapshot();
  return snapshot.categories.map((category) => category.name);
}

export async function getCategoryCards() {
  const snapshot = await getCachedCatalogSnapshot();
  return snapshot.categories
    .filter((category) => category.isActive)
    .sort(bySortOrder)
    .map((category) => ({
      category: category.name,
      title: category.name,
      image: category.image,
    }));
}

export async function getAdminCategories() {
  if (!isSupabaseConfigured()) {
    return fallbackCategories();
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, image_path, search_tags, sort_order, is_active")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapCatalogCategory).sort(bySortOrder);
}

export async function getAdminProducts() {
  if (!isSupabaseConfigured()) {
    return fallbackProducts.map((product) => ({
      uuid: product.id,
      slug: product.id,
      name: product.nombre,
      description: product.descripcion,
      imagePath: product.imagen,
      tags: product.tags ?? [],
      isFeatured: product.destacado,
      featuredOrder: product.featuredOrder ?? null,
      isActive: true,
      categoryIds: getResolvedProductCategories(product),
      presentations: product.presentaciones,
    }));
  }

  const supabase = await createServerSupabaseClient();
  const {
    categoriesResult,
    productsResult,
    presentationsResult,
    productCategoriesResult,
  } = await fetchCatalogRows(supabase, true);

  if (
    categoriesResult.error ||
    productsResult.error ||
    presentationsResult.error ||
    productCategoriesResult.error
  ) {
    throw new Error(
      [
        categoriesResult.error?.message,
        productsResult.error?.message,
        presentationsResult.error?.message,
        productCategoriesResult.error?.message,
      ]
        .filter(Boolean)
        .join(" | "),
    );
  }

  const categoryRows = categoriesResult.data ?? [];
  const presentationsByProductId = new Map<string, ProductPresentation[]>();
  const categoryAssignmentsByProductId = new Map<string, string[]>();

  for (const presentationRow of presentationsResult.data ?? []) {
    const list = presentationsByProductId.get(presentationRow.product_id) ?? [];
    list.push(mapProductPresentation(presentationRow));
    presentationsByProductId.set(presentationRow.product_id, list);
  }

  for (const assignment of productCategoriesResult.data ?? []) {
    const list = categoryAssignmentsByProductId.get(assignment.product_id) ?? [];
    list.push(assignment.category_id);
    categoryAssignmentsByProductId.set(assignment.product_id, list);
  }

  const categoryById = new Map(categoryRows.map((category) => [category.id, category]));

  return (productsResult.data ?? [])
    .map((productRow) => ({
      uuid: productRow.id,
      slug: productRow.slug,
      name: productRow.name,
      description: productRow.description,
      imagePath:
        productRow.image_path ?? "/productos/frutos-secos-placeholder.svg",
      tags: productRow.tags ?? [],
      isFeatured: productRow.is_featured,
      featuredOrder: productRow.featured_order,
      isActive: productRow.is_active,
      categoryIds: (categoryAssignmentsByProductId.get(productRow.id) ?? []).filter((categoryId) =>
        categoryById.has(categoryId),
      ),
      presentations: (presentationsByProductId.get(productRow.id) ?? []).sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
      ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export async function getAdminProductBySlug(slug: string) {
  const products = await getAdminProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function refreshCatalogCache() {
  revalidateTag("catalog", "max");
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export { CATEGORY_ORDER };
