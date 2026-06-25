import "server-only";

import fs from "node:fs";
import path from "node:path";
import { cacheTag, revalidateTag } from "next/cache";
import { createClient as createPublicClient, type SupabaseClient } from "@supabase/supabase-js";
import productsData from "@/data/products.json";
import {
  CATEGORY_CONFIG,
  CATEGORY_ORDER,
  getResolvedProductCategories,
} from "@/lib/catalog";
import {
  type PresentationMeasurementKind,
  type PresentationMeasurementUnit,
  calculateAmountInBaseUnits,
  inferPresentationMeasurementFromLabel,
} from "@/lib/presentation";
import { generateBaseSku, generatePresentationSku, normalizeManualSku } from "@/lib/sku";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
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
> & {
  base_sku?: string | null;
};
type CategoryRow = Pick<
  Database["public"]["Tables"]["categories"]["Row"],
  "id" | "slug" | "name" | "image_path"
> & {
  search_tags?: Database["public"]["Tables"]["categories"]["Row"]["search_tags"];
  sort_order?: Database["public"]["Tables"]["categories"]["Row"]["sort_order"];
  is_active?: Database["public"]["Tables"]["categories"]["Row"]["is_active"];
};
type ProductPresentationRow = Pick<
  Database["public"]["Tables"]["product_presentations"]["Row"],
  | "id"
  | "product_id"
  | "label"
  | "price_cents"
  | "sort_order"
  | "is_active"
> & {
  sku?: string | null;
  measurement_kind?: string | null;
  amount_value?: string | number | null;
  amount_unit?: string | null;
  amount_in_base_units?: string | number | null;
};
type ProductCategoryRow = Pick<
  Database["public"]["Tables"]["product_categories"]["Row"],
  "product_id" | "category_id" | "sort_order"
>;

export type AdminCatalogProduct = {
  uuid: string;
  slug: string;
  baseSku: string;
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

export type AdminCatalogCategory = {
  id: string;
  slug: string;
  name: string;
  imagePath: string;
  searchTags: string[];
  sortOrder: number;
  isActive: boolean;
};

type CatalogSnapshot = {
  categories: CatalogCategory[];
  products: Product[];
};

const fallbackProducts = (productsData as Product[]).map((product) => ({
  ...product,
  baseSku: generateBaseSku(product.id, product.nombre),
  presentaciones: product.presentaciones.map((presentation) => {
    const inferred = inferPresentationMeasurementFromLabel(presentation.etiqueta);
    const baseSku = generateBaseSku(product.id, product.nombre);

    return {
      ...presentation,
      sku: generatePresentationSku({
        baseSku,
        measurementKind: inferred.measurementKind,
        amountValue: inferred.amountValue,
        amountUnit: inferred.amountUnit,
      }),
      measurementKind: inferred.measurementKind,
      amountValue: inferred.amountValue,
      amountUnit: inferred.amountUnit,
      amountInBaseUnits: calculateAmountInBaseUnits(inferred),
    };
  }),
}));
const fallbackProductBySlug = new Map(
  fallbackProducts.flatMap((product) => [
    [product.id, product] as const,
    [slugify(product.id), product] as const,
  ]),
);
const publicRoot = path.join(process.cwd(), "public");

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

function isRemoteImagePath(imagePath: string) {
  return (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("/storage/")
  );
}

function hasLocalPublicAsset(imagePath: string) {
  if (!imagePath.startsWith("/")) {
    return false;
  }

  return fs.existsSync(path.join(publicRoot, imagePath.slice(1)));
}

function resolveImagePath(...candidates: Array<string | null | undefined>) {
  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    if (isRemoteImagePath(candidate) || hasLocalPublicAsset(candidate)) {
      return candidate;
    }
  }

  return null;
}

function isMissingColumnError(message: string) {
  return message.toLowerCase().includes("does not exist");
}

async function fetchPresentationRows(
  supabase: SupabaseClient<Database>,
  includeInactive: boolean,
) {
  const selectWithMeasurement =
    "id, product_id, sku, label, measurement_kind, amount_value, amount_unit, amount_in_base_units, price_cents, sort_order, is_active";
  const legacySelect = "id, product_id, label, price_cents, sort_order, is_active";

  let query = supabase
    .from("product_presentations")
    .select(selectWithMeasurement)
    .order("sort_order", { ascending: true });

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const result = await query;

  if (!result.error || !isMissingColumnError(result.error.message)) {
    return result;
  }

  let legacyQuery = supabase
    .from("product_presentations")
    .select(legacySelect)
    .order("sort_order", { ascending: true });

  if (!includeInactive) {
    legacyQuery = legacyQuery.eq("is_active", true);
  }

  return legacyQuery;
}

async function fetchProductRows(
  supabase: SupabaseClient<Database>,
  includeInactive: boolean,
) {
  const selectWithSku =
    "id, slug, base_sku, name, description, image_path, tags, is_featured, featured_order, is_active";
  const legacySelect =
    "id, slug, name, description, image_path, tags, is_featured, featured_order, is_active";

  let query = supabase.from("products").select(selectWithSku).order("name", { ascending: true });

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const result = await query;

  if (!result.error || !isMissingColumnError(result.error.message)) {
    return result;
  }

  let legacyQuery = supabase.from("products").select(legacySelect).order("name", { ascending: true });

  if (!includeInactive) {
    legacyQuery = legacyQuery.eq("is_active", true);
  }

  return legacyQuery;
}

async function fetchCategoryRows(supabase: SupabaseClient<Database>) {
  const selectWithMetadata =
    "id, slug, name, image_path, search_tags, sort_order, is_active";
  const legacySelect = "id, slug, name, image_path";

  const result = await supabase
    .from("categories")
    .select(selectWithMetadata)
    .order("sort_order", { ascending: true });

  if (!result.error || !isMissingColumnError(result.error.message)) {
    return result;
  }

  return supabase.from("categories").select(legacySelect).order("name", { ascending: true });
}

async function fetchCatalogRows(
  supabase: SupabaseClient<Database>,
  includeInactive: boolean,
) {
  const categoriesPromise = fetchCategoryRows(supabase);

  const productsPromise = fetchProductRows(supabase, includeInactive);
  const productCategoriesQuery = supabase
    .from("product_categories")
    .select("product_id, category_id, sort_order")
    .order("sort_order", { ascending: true });

  const presentationsPromise = fetchPresentationRows(supabase, includeInactive);
  const [categoriesResult, productsResult, presentationsResult, productCategoriesResult] =
    await Promise.all([
      categoriesPromise,
      productsPromise,
      presentationsPromise,
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
  const fallbackIndex = fallback
    ? CATEGORY_ORDER.findIndex((categoryName) => categoryName === fallback.category)
    : -1;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    image:
      resolveImagePath(
        row.image_path,
        fallback?.image,
        "/categorias-optimized/semillas.webp",
      ) ?? "/categorias-optimized/semillas.webp",
    searchTags: row.search_tags ?? [...(fallback?.searchTags ?? [])],
    sortOrder: row.sort_order ?? (fallbackIndex >= 0 ? fallbackIndex : Number.MAX_SAFE_INTEGER),
    isActive: row.is_active ?? true,
  };
}

function mapProductPresentation(
  row: ProductPresentationRow,
  baseSku: string,
): ProductPresentation {
  const inferredMeasurement = inferPresentationMeasurementFromLabel(row.label);
  const measurementKind =
    (row.measurement_kind as PresentationMeasurementKind | undefined) ??
    inferredMeasurement.measurementKind;
  const amountValue =
    row.amount_value != null
      ? Number.parseFloat(String(row.amount_value))
      : inferredMeasurement.amountValue;
  const amountUnit =
    (row.amount_unit as PresentationMeasurementUnit | undefined) ??
    inferredMeasurement.amountUnit;

  return {
    id: row.id,
    sku:
      normalizeManualSku(row.sku) ||
      generatePresentationSku({
        baseSku,
        measurementKind,
        amountValue,
        amountUnit,
      }),
    etiqueta: row.label,
    precio: row.price_cents / 100,
    measurementKind,
    amountValue,
    amountUnit,
    amountInBaseUnits:
      row.amount_in_base_units != null
        ? Number.parseFloat(String(row.amount_in_base_units))
        : calculateAmountInBaseUnits(inferredMeasurement),
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
  const productRowById = new Map(productRows.map((row) => [row.id, row]));
  const presentationsByProductId = new Map<string, ProductPresentation[]>();
  const categoryAssignmentsByProductId = new Map<
    string,
    { categoryId: string; sortOrder: number }[]
  >();

  for (const presentationRow of presentationRows) {
    const productRow = productRowById.get(presentationRow.product_id);
    const baseSku =
      normalizeManualSku(productRow?.base_sku) ||
      generateBaseSku(productRow?.slug, productRow?.name, presentationRow.product_id);
    const list = presentationsByProductId.get(presentationRow.product_id) ?? [];
    list.push(mapProductPresentation(presentationRow, baseSku));
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
    const fallbackProduct =
      fallbackProductBySlug.get(row.slug) ??
      fallbackProductBySlug.get(slugify(row.slug));
    const presentations = (presentationsByProductId.get(row.id) ?? []).sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    );
    const categoryAssignments = (categoryAssignmentsByProductId.get(row.id) ?? [])
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((assignment) => categoryById.get(assignment.categoryId))
      .filter((category): category is CatalogCategory => Boolean(category));
    const categorias = categoryAssignments.map((category) => category.name);
    const baseSku =
      normalizeManualSku(row.base_sku) || generateBaseSku(row.slug, row.name, fallbackProduct?.id);

    return {
      id: row.slug,
      uuid: row.id,
      baseSku,
      nombre: row.name,
      categoria: categorias[0] ?? "Sin categoria",
      categorias,
      descripcion: row.description,
      tags: row.tags ?? [],
      presentaciones: presentations,
      imagen:
        resolveImagePath(
          row.image_path,
          fallbackProduct?.imagen,
          "/productos/frutos-secos-placeholder.svg",
        ) ?? "/productos/frutos-secos-placeholder.svg",
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
      (productsResult.data ?? []) as ProductRow[],
      ((categoriesResult.data ?? []) as CategoryRow[]).filter(
        (category) => category.is_active !== false,
      ),
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

  const supabase = createServiceRoleClient();
  const { data, error } = await fetchCategoryRows(supabase);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapCatalogCategory).sort(bySortOrder);
}

export async function getAdminCategoryRecords() {
  const categories = await getAdminCategories();

  return categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
    imagePath: category.image,
    searchTags: category.searchTags,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
  })) satisfies AdminCatalogCategory[];
}

export async function getAdminCategoryById(id: string) {
  const categories = await getAdminCategoryRecords();
  return categories.find((category) => category.id === id) ?? null;
}

export async function getAdminProducts() {
  if (!isSupabaseConfigured()) {
    return fallbackProducts.map((product) => ({
      uuid: product.id,
      slug: product.id,
      baseSku: generateBaseSku(product.baseSku, product.id, product.nombre),
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

  const supabase = createServiceRoleClient();
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
  const productRows = (productsResult.data ?? []) as ProductRow[];
  const productRowById = new Map(productRows.map((row) => [row.id, row]));
  const presentationsByProductId = new Map<string, ProductPresentation[]>();
  const categoryAssignmentsByProductId = new Map<string, string[]>();

  for (const presentationRow of presentationsResult.data ?? []) {
    const productRow = productRowById.get(presentationRow.product_id);
    const baseSku =
      normalizeManualSku(productRow?.base_sku) ||
      generateBaseSku(productRow?.slug, productRow?.name, presentationRow.product_id);
    const list = presentationsByProductId.get(presentationRow.product_id) ?? [];
    list.push(mapProductPresentation(presentationRow, baseSku));
    presentationsByProductId.set(presentationRow.product_id, list);
  }

  for (const assignment of productCategoriesResult.data ?? []) {
    const list = categoryAssignmentsByProductId.get(assignment.product_id) ?? [];
    list.push(assignment.category_id);
    categoryAssignmentsByProductId.set(assignment.product_id, list);
  }

  const categoryById = new Map(categoryRows.map((category) => [category.id, category]));

  return productRows
    .map((productRow) => {
      const fallbackProduct =
        fallbackProductBySlug.get(productRow.slug) ??
        fallbackProductBySlug.get(slugify(productRow.slug));

      return {
        uuid: productRow.id,
        slug: productRow.slug,
        baseSku:
          normalizeManualSku(productRow.base_sku) ||
          generateBaseSku(productRow.slug, productRow.name, fallbackProduct?.id),
        name: productRow.name,
        description: productRow.description,
        imagePath:
          resolveImagePath(
            productRow.image_path,
            fallbackProduct?.imagen,
            "/productos/frutos-secos-placeholder.svg",
          ) ?? "/productos/frutos-secos-placeholder.svg",
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
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export async function getAdminProductBySlug(slug: string) {
  const products = await getAdminProducts();
  const normalizedSlug = slugify(slug);

  return (
    products.find(
      (product) => product.slug === slug || slugify(product.slug) === normalizedSlug,
    ) ?? null
  );
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
