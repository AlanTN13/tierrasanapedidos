"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdminUser } from "@/lib/supabase/admin";
import { refreshCatalogCache } from "@/lib/catalog-data";
import { refreshHomeCache } from "@/lib/home-data";
import { refreshRecipesCache } from "@/lib/recipes-data";
import {
  calculateAmountInBaseUnits,
  formatPresentationLabel,
  normalizeMeasurementUnitForKind,
  parseMeasurementValue,
  type PresentationMeasurementKind,
  type PresentationMeasurementUnit,
} from "@/lib/presentation";
import {
  generateBaseSku,
  generatePresentationSku,
  normalizeManualSku,
} from "@/lib/sku";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type ParsedPresentation = {
  id: string | undefined;
  sku: string;
  label: string;
  measurementKind: PresentationMeasurementKind;
  amountValue: number;
  amountUnit: PresentationMeasurementUnit;
  amountInBaseUnits: number;
  priceCents: number;
  sortOrder: number;
};

const PRODUCT_IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "svg"] as const;
const PRODUCT_IMAGE_MAX_DIMENSION = 1600;
const PRODUCT_IMAGE_WEBP_QUALITY = 82;
const PRODUCT_IMAGE_BUCKET = "product-images";
const PRODUCT_IMAGE_PREFIX = "products";
const CATEGORY_IMAGE_PREFIX = "categories";
const HOME_IMAGE_PREFIX = "home";
const RECIPE_IMAGE_PREFIX = "recipes";
const PRODUCT_IMAGE_PLACEHOLDER = "/productos/frutos-secos-placeholder.svg";
const CATEGORY_IMAGE_PLACEHOLDER = "/categorias-optimized/semillas.webp";
const HOME_BANNER_PLACEHOLDER = "/hero-optimized/banner-home.webp";
const RECIPE_IMAGE_PLACEHOLDER = "/recetas/trufas-fit.webp";

function isMissingColumnError(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes("does not exist") || normalized.includes("schema cache");
}

export async function signOutAdmin() {
  if (!isSupabaseConfigured()) {
    redirect("/admin/login");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login?signedOut=1");
}

export async function saveProduct(formData: FormData) {
  await requireAdminUser();

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase no está configurado.");
  }

  const supabase = await createClient();
  const productId = readString(formData.get("productId"));
  const name = readString(formData.get("name"));
  const submittedSlug = readString(formData.get("slug"));
  const slug = slugify(submittedSlug || name);
  const baseSku = normalizeManualSku(readString(formData.get("baseSku"))) || generateBaseSku(slug, name);
  const description = readString(formData.get("description"));
  const existingImagePath = readString(formData.get("existingImagePath"));
  const removeExistingImage = readBooleanFlag(formData.get("removeExistingImage"));
  const imageFile = formData.get("imageFile");
  const tags = readString(formData.get("tags"))
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const isFeatured = formData.get("isFeatured") === "on";
  const isActive = formData.get("isActive") === "on";
  const featuredOrder = readNullableNumber(formData.get("featuredOrder"));
  const categoryIds = formData
    .getAll("categoryIds")
    .map((value) => readString(value))
    .filter(Boolean);
  const presentations = parsePresentations(formData, baseSku);
  const imagePath = await resolveProductImagePath({
    slug,
    name,
    imageFile,
    existingImagePath,
    removeExistingImage,
  });

  if (!slug || !name || !description || !imagePath) {
    throw new Error("Faltan campos obligatorios del producto.");
  }

  if (categoryIds.length === 0) {
    throw new Error("El producto necesita al menos una categoría.");
  }

  if (presentations.length === 0) {
    throw new Error("El producto necesita al menos una presentación.");
  }

  let resolvedProductId = productId;

  if (resolvedProductId) {
    const productPayload = {
      slug,
      base_sku: baseSku,
      name,
      description,
      image_path: imagePath,
      tags,
      is_featured: isFeatured,
      featured_order: featuredOrder,
      is_active: isActive,
    };
    const { error } = await supabase
      .from("products")
      .update(productPayload)
      .eq("id", resolvedProductId);

    if (error && isMissingColumnError(error.message)) {
      const { error: legacyError } = await supabase
        .from("products")
        .update({
          slug,
          name,
          description,
          image_path: imagePath,
          tags,
          is_featured: isFeatured,
          featured_order: featuredOrder,
          is_active: isActive,
        })
        .eq("id", resolvedProductId);

      if (legacyError) {
        throw new Error(legacyError.message);
      }
    } else if (error) {
      throw new Error(error.message);
    }
  } else {
    const productPayload = {
      slug,
      base_sku: baseSku,
      name,
      description,
      image_path: imagePath,
      tags,
      is_featured: isFeatured,
      featured_order: featuredOrder,
      is_active: isActive,
    };
    const { data, error } = await supabase
      .from("products")
      .insert(productPayload)
      .select("id")
      .single();

    if (error && isMissingColumnError(error.message)) {
      const { data: legacyData, error: legacyError } = await supabase
        .from("products")
        .insert({
          slug,
          name,
          description,
          image_path: imagePath,
          tags,
          is_featured: isFeatured,
          featured_order: featuredOrder,
          is_active: isActive,
        })
        .select("id")
        .single();

      if (legacyError || !legacyData) {
        throw new Error(legacyError?.message ?? "No se pudo crear el producto.");
      }

      resolvedProductId = legacyData.id;
    } else if (error || !data) {
      throw new Error(error?.message ?? "No se pudo crear el producto.");
    } else {
      resolvedProductId = data.id;
    }
  }

  const { data: existingPresentations, error: existingPresentationsError } = await supabase
    .from("product_presentations")
    .select("id")
    .eq("product_id", resolvedProductId);

  if (existingPresentationsError) {
    throw new Error(existingPresentationsError.message);
  }

  const submittedPresentationIds = presentations
    .map((presentation) => presentation.id)
    .filter((value): value is string => Boolean(value));
  const existingPresentationIds = (existingPresentations ?? []).map((item) => item.id);
  const presentationIdsToDeactivate = existingPresentationIds.filter(
    (id) => !submittedPresentationIds.includes(id),
  );

  if (presentationIdsToDeactivate.length > 0) {
    const { error } = await supabase
      .from("product_presentations")
      .update({
        is_active: false,
      })
      .in("id", presentationIdsToDeactivate);

    if (error) {
      throw new Error(error.message);
    }
  }

  for (const presentation of presentations) {
    if (presentation.id) {
      const presentationPayload = {
        sku: presentation.sku,
        label: presentation.label,
        measurement_kind: presentation.measurementKind,
        amount_value: String(presentation.amountValue),
        amount_unit: presentation.amountUnit,
        amount_in_base_units: String(presentation.amountInBaseUnits),
        price_cents: presentation.priceCents,
        sort_order: presentation.sortOrder,
        is_active: true,
      };
      const { error } = await supabase
        .from("product_presentations")
        .update(presentationPayload)
        .eq("id", presentation.id);

      if (error && isMissingColumnError(error.message)) {
        const { error: legacyError } = await supabase
          .from("product_presentations")
          .update({
            label: presentation.label,
            measurement_kind: presentation.measurementKind,
            amount_value: String(presentation.amountValue),
            amount_unit: presentation.amountUnit,
            amount_in_base_units: String(presentation.amountInBaseUnits),
            price_cents: presentation.priceCents,
            sort_order: presentation.sortOrder,
            is_active: true,
          })
          .eq("id", presentation.id);

        if (legacyError) {
          throw new Error(legacyError.message);
        }
      } else if (error) {
        throw new Error(error.message);
      }
    } else {
      const presentationPayload = {
        product_id: resolvedProductId,
        sku: presentation.sku,
        label: presentation.label,
        measurement_kind: presentation.measurementKind,
        amount_value: String(presentation.amountValue),
        amount_unit: presentation.amountUnit,
        amount_in_base_units: String(presentation.amountInBaseUnits),
        price_cents: presentation.priceCents,
        sort_order: presentation.sortOrder,
        is_active: true,
      };
      const { error } = await supabase.from("product_presentations").insert(presentationPayload);

      if (error && isMissingColumnError(error.message)) {
        const { error: legacyError } = await supabase.from("product_presentations").insert({
          product_id: resolvedProductId,
          label: presentation.label,
          measurement_kind: presentation.measurementKind,
          amount_value: String(presentation.amountValue),
          amount_unit: presentation.amountUnit,
          amount_in_base_units: String(presentation.amountInBaseUnits),
          price_cents: presentation.priceCents,
          sort_order: presentation.sortOrder,
          is_active: true,
        });

        if (legacyError) {
          throw new Error(legacyError.message);
        }
      } else if (error) {
        throw new Error(error.message);
      }
    }
  }

  const { error: deleteCategoriesError } = await supabase
    .from("product_categories")
    .delete()
    .eq("product_id", resolvedProductId);

  if (deleteCategoriesError) {
    throw new Error(deleteCategoriesError.message);
  }

  const { error: insertCategoriesError } = await supabase
    .from("product_categories")
    .insert(
      categoryIds.map((categoryId, index) => ({
        product_id: resolvedProductId,
        category_id: categoryId,
        sort_order: index,
      })),
    );

  if (insertCategoriesError) {
    throw new Error(insertCategoriesError.message);
  }

  await refreshCatalogCache();
  redirect(`/admin/products/${slug}?saved=1`);
}

export async function saveCategory(formData: FormData) {
  await requireAdminUser();

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase no está configurado.");
  }

  const supabase = await createClient();
  const categoryId = readString(formData.get("categoryId"));
  const name = readString(formData.get("name"));
  const submittedSlug = readString(formData.get("slug"));
  const slug = slugify(submittedSlug || name);
  const existingImagePath = readString(formData.get("existingImagePath"));
  const removeExistingImage = readBooleanFlag(formData.get("removeExistingImage"));
  const imagePathOverride = validateManualImagePath(readString(formData.get("imagePath")));
  const imageFile = formData.get("imageFile");
  const searchTags = readString(formData.get("searchTags"))
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const sortOrder = readNumberOrDefault(formData.get("sortOrder"), 0);
  const isActive = formData.get("isActive") === "on";
  const imagePath = await resolveCategoryImagePath({
    slug,
    name,
    imageFile,
    existingImagePath,
    imagePathOverride,
    removeExistingImage,
  });

  if (!name || !slug) {
    throw new Error("La categoría necesita nombre y slug.");
  }

  let resolvedCategoryId = categoryId;

  if (resolvedCategoryId) {
    const { error } = await supabase
      .from("categories")
      .update({
        slug,
        name,
        image_path: imagePath,
        search_tags: searchTags,
        sort_order: sortOrder,
        is_active: isActive,
      })
      .eq("id", resolvedCategoryId);

    if (error) {
      throw new Error(error.message);
    }
  } else {
    const { data, error } = await supabase
      .from("categories")
      .insert({
        slug,
        name,
        image_path: imagePath,
        search_tags: searchTags,
        sort_order: sortOrder,
        is_active: isActive,
      })
      .select("id")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "No se pudo crear la categoría.");
    }

    resolvedCategoryId = data.id;
  }

  await refreshCatalogCache();
  redirect(`/admin/categories/${resolvedCategoryId}?saved=1`);
}

export async function saveHomeSettings(formData: FormData) {
  await requireAdminUser();

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase no está configurado.");
  }

  const supabase = await createClient();
  const existingHeroBannerPath = readString(formData.get("existingHeroBannerPath"));
  const heroBannerFile = formData.get("heroBannerFile");
  const heroBannerPath = await resolveHomeBannerPath({
    imageFile: heroBannerFile,
    existingImagePath: existingHeroBannerPath,
  });

  const { error } = await supabase.from("home_settings").upsert({
    id: "main",
    hero_banner_path: heroBannerPath,
  });

  if (error) {
    throw new Error(error.message);
  }

  await refreshHomeCache();
  redirect("/admin/home?saved=1");
}

export async function saveRecipe(formData: FormData) {
  await requireAdminUser();

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase no está configurado.");
  }

  const supabase = await createClient();
  const recipeId = readString(formData.get("recipeId"));
  const title = readString(formData.get("title"));
  const submittedSlug = readString(formData.get("slug"));
  const slug = slugify(submittedSlug || title);
  const shortDescription = readString(formData.get("shortDescription"));
  const longDescription = readString(formData.get("longDescription"));
  const targetCategory = readString(formData.get("targetCategory"));
  const prepLabel = readString(formData.get("prepLabel"));
  const servingsLabel = readString(formData.get("servingsLabel"));
  const sortOrder = readNumberOrDefault(formData.get("sortOrder"), 0);
  const isActive = formData.get("isActive") === "on";
  const existingImagePath = readString(formData.get("existingImagePath"));
  const removeExistingImage = readBooleanFlag(formData.get("removeExistingImage"));
  const imageFile = formData.get("imageFile");
  const ingredients = parseTextAreaList(formData.get("ingredients"));
  const steps = parseTextAreaList(formData.get("steps"));
  const productIds = formData
    .getAll("productIds")
    .map((value) => readString(value))
    .filter(Boolean);
  const heroImagePath = await resolveRecipeImagePath({
    slug,
    title,
    imageFile,
    existingImagePath,
    removeExistingImage,
  });

  if (
    !slug ||
    !title ||
    !shortDescription ||
    !longDescription ||
    !targetCategory ||
    !prepLabel ||
    !servingsLabel
  ) {
    throw new Error("La receta necesita título, descripciones, categoría, tiempo y rinde.");
  }

  if (ingredients.length === 0) {
    throw new Error("La receta necesita al menos un ingrediente.");
  }

  if (steps.length === 0) {
    throw new Error("La receta necesita al menos un paso.");
  }

  if (productIds.length === 0) {
    throw new Error("La receta necesita al menos un producto sugerido.");
  }

  let resolvedRecipeId = recipeId;

  if (resolvedRecipeId) {
    const { error } = await supabase
      .from("recipes")
      .update({
        slug,
        title,
        short_description: shortDescription,
        long_description: longDescription,
        hero_image_path: heroImagePath,
        target_category: targetCategory,
        prep_label: prepLabel,
        servings_label: servingsLabel,
        ingredients,
        steps,
        sort_order: sortOrder,
        is_active: isActive,
      })
      .eq("id", resolvedRecipeId);

    if (error) {
      throw new Error(error.message);
    }
  } else {
    const { data, error } = await supabase
      .from("recipes")
      .insert({
        slug,
        title,
        short_description: shortDescription,
        long_description: longDescription,
        hero_image_path: heroImagePath,
        target_category: targetCategory,
        prep_label: prepLabel,
        servings_label: servingsLabel,
        ingredients,
        steps,
        sort_order: sortOrder,
        is_active: isActive,
      })
      .select("id")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "No se pudo crear la receta.");
    }

    resolvedRecipeId = data.id;
  }

  const { error: deleteProductLinksError } = await supabase
    .from("recipe_products")
    .delete()
    .eq("recipe_id", resolvedRecipeId);

  if (deleteProductLinksError) {
    throw new Error(deleteProductLinksError.message);
  }

  const { error: insertProductLinksError } = await supabase
    .from("recipe_products")
    .insert(
      productIds.map((productId, index) => ({
        recipe_id: resolvedRecipeId,
        product_id: productId,
        sort_order: index,
      })),
    );

  if (insertProductLinksError) {
    throw new Error(insertProductLinksError.message);
  }

  await refreshRecipesCache();
  redirect(`/admin/recipes/${slug}?saved=1`);
}

function parsePresentations(formData: FormData, baseSku: string): ParsedPresentation[] {
  const ids = formData.getAll("presentationId").map((value) => readString(value));
  const skuOverrides = formData
    .getAll("presentationSkuOverride")
    .map((value) => readString(value));
  const measurementKinds = formData
    .getAll("presentationMeasurementKind")
    .map((value) => readString(value));
  const amountValues = formData
    .getAll("presentationAmountValue")
    .map((value) => readString(value));
  const amountUnits = formData
    .getAll("presentationAmountUnit")
    .map((value) => readString(value));
  const prices = formData.getAll("presentationPrice").map((value) => readString(value));
  const sortOrders = formData
    .getAll("presentationSortOrder")
    .map((value) => readString(value));

  const parsedPresentations = amountValues
    .map((rawAmountValue, index) => {
      const price = prices[index] ?? "";
      const rawMeasurementKind = measurementKinds[index] ?? "unit";
      const rawAmountUnit = amountUnits[index] ?? "unit";

      if (!rawAmountValue || !price) {
        return null;
      }

      const measurementKind = parseMeasurementKind(rawMeasurementKind);
      const amountValue = parseMeasurementValue(rawAmountValue);
      const amountUnit = normalizeMeasurementUnitForKind(
        measurementKind,
        rawAmountUnit,
      );
      const amountInBaseUnits = calculateAmountInBaseUnits({
        amountValue,
        amountUnit,
      });

      return {
        id: ids[index] || undefined,
        sku:
          normalizeManualSku(skuOverrides[index] ?? "") ||
          generatePresentationSku({
            baseSku,
            measurementKind,
            amountValue,
            amountUnit,
          }),
        label: formatPresentationLabel({
          measurementKind,
          amountValue,
          amountUnit,
        }),
        measurementKind,
        amountValue,
        amountUnit,
        amountInBaseUnits,
        priceCents: parseCurrencyToCents(price),
        sortOrder: Number.parseInt(sortOrders[index] || String(index), 10) || index,
      };
    })
    .filter((value): value is ParsedPresentation => Boolean(value));

  return parsedPresentations;
}

function parseMeasurementKind(value: string): PresentationMeasurementKind {
  if (value === "weight" || value === "volume") {
    return value;
  }

  return "unit";
}

function parseCurrencyToCents(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".").trim();
  const amount = Number.parseFloat(normalized);

  if (Number.isNaN(amount)) {
    throw new Error(`Precio inválido: ${value}`);
  }

  return Math.round(amount * 100);
}

async function resolveProductImagePath({
  slug,
  name,
  imageFile,
  existingImagePath,
  removeExistingImage,
}: {
  slug: string;
  name: string;
  imageFile: FormDataEntryValue | null;
  existingImagePath: string;
  removeExistingImage: boolean;
}) {
  if (!slug || !name) {
    return existingImagePath || PRODUCT_IMAGE_PLACEHOLDER;
  }

  if (removeExistingImage && (!(imageFile instanceof File) || imageFile.size === 0)) {
    await removeStoredImageAtPath(existingImagePath);
    return PRODUCT_IMAGE_PLACEHOLDER;
  }

  if (!(imageFile instanceof File) || imageFile.size === 0) {
    return existingImagePath || PRODUCT_IMAGE_PLACEHOLDER;
  }

  const extension = getOutputImageExtension(imageFile);
  const normalizedBaseName = slugify(slug || name);
  const filePath = buildVersionedStorageObjectPath(
    PRODUCT_IMAGE_PREFIX,
    normalizedBaseName,
    extension,
  );
  const storagePath = buildStorageProxyPath(PRODUCT_IMAGE_BUCKET, filePath);

  await uploadImageToStorage(imageFile, filePath);
  await removeStoredImageAtPath(existingImagePath);

  return storagePath;
}

async function resolveCategoryImagePath({
  slug,
  name,
  imageFile,
  existingImagePath,
  imagePathOverride,
  removeExistingImage,
}: {
  slug: string;
  name: string;
  imageFile: FormDataEntryValue | null;
  existingImagePath: string;
  imagePathOverride: string;
  removeExistingImage: boolean;
}) {
  const normalizedManualPath = imagePathOverride || "";

  if (!slug || !name) {
    return normalizedManualPath || existingImagePath || CATEGORY_IMAGE_PLACEHOLDER;
  }

  if (
    removeExistingImage &&
    !(imageFile instanceof File) &&
    !normalizedManualPath
  ) {
    await removeStoredImageAtPath(existingImagePath);
    return CATEGORY_IMAGE_PLACEHOLDER;
  }

  if (
    removeExistingImage &&
    imageFile instanceof File &&
    imageFile.size === 0 &&
    !normalizedManualPath
  ) {
    await removeStoredImageAtPath(existingImagePath);
    return CATEGORY_IMAGE_PLACEHOLDER;
  }

  if (!(imageFile instanceof File) || imageFile.size === 0) {
    if (normalizedManualPath && normalizedManualPath !== existingImagePath) {
      await removeStoredImageAtPath(existingImagePath);
    }

    return normalizedManualPath || existingImagePath || CATEGORY_IMAGE_PLACEHOLDER;
  }

  const extension = getOutputImageExtension(imageFile);
  const normalizedBaseName = slugify(slug || name);
  const filePath = buildVersionedStorageObjectPath(
    CATEGORY_IMAGE_PREFIX,
    normalizedBaseName,
    extension,
  );
  const storagePath = buildStorageProxyPath(PRODUCT_IMAGE_BUCKET, filePath);

  await uploadImageToStorage(imageFile, filePath);
  await removeStoredImageAtPath(existingImagePath);

  return storagePath;
}

async function resolveHomeBannerPath({
  imageFile,
  existingImagePath,
}: {
  imageFile: FormDataEntryValue | null;
  existingImagePath: string;
}) {
  if (!(imageFile instanceof File) || imageFile.size === 0) {
    return existingImagePath || HOME_BANNER_PLACEHOLDER;
  }

  const extension = getOutputImageExtension(imageFile);
  const filePath = buildVersionedStorageObjectPath(
    HOME_IMAGE_PREFIX,
    "banner-home",
    extension,
  );
  const storagePath = buildStorageProxyPath(PRODUCT_IMAGE_BUCKET, filePath);

  await uploadImageToStorage(imageFile, filePath);
  await removeStoredImageAtPath(existingImagePath);

  return storagePath;
}

async function resolveRecipeImagePath({
  slug,
  title,
  imageFile,
  existingImagePath,
  removeExistingImage,
}: {
  slug: string;
  title: string;
  imageFile: FormDataEntryValue | null;
  existingImagePath: string;
  removeExistingImage: boolean;
}) {
  if (!slug || !title) {
    return existingImagePath || RECIPE_IMAGE_PLACEHOLDER;
  }

  if (removeExistingImage && (!(imageFile instanceof File) || imageFile.size === 0)) {
    await removeStoredImageAtPath(existingImagePath);
    return RECIPE_IMAGE_PLACEHOLDER;
  }

  if (!(imageFile instanceof File) || imageFile.size === 0) {
    return existingImagePath || RECIPE_IMAGE_PLACEHOLDER;
  }

  const extension = getOutputImageExtension(imageFile);
  const normalizedBaseName = slugify(slug || title);
  const filePath = buildVersionedStorageObjectPath(
    RECIPE_IMAGE_PREFIX,
    normalizedBaseName,
    extension,
  );
  const storagePath = buildStorageProxyPath(PRODUCT_IMAGE_BUCKET, filePath);

  await uploadImageToStorage(imageFile, filePath);
  await removeStoredImageAtPath(existingImagePath);

  return storagePath;
}

function validateManualImagePath(imagePath: string) {
  if (!imagePath) {
    return "";
  }

  const normalizedPath = imagePath.trim();
  const allowedExtensionPattern = /\.(webp|svg)(?:$|[?#])/i;

  if (!allowedExtensionPattern.test(normalizedPath)) {
    throw new Error("La ruta manual solo puede apuntar a imágenes WEBP o SVG.");
  }

  if (
    normalizedPath.startsWith("/") ||
    normalizedPath.startsWith("http://") ||
    normalizedPath.startsWith("https://")
  ) {
    return normalizedPath;
  }

  throw new Error("La ruta manual debe empezar con /, http:// o https://.");
}

function getOutputImageExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();

  if (fromName && PRODUCT_IMAGE_EXTENSIONS.includes(fromName as (typeof PRODUCT_IMAGE_EXTENSIONS)[number])) {
    return fromName === "svg" ? "svg" : "webp";
  }

  switch (file.type) {
    case "image/png":
    case "image/jpeg":
    case "image/webp":
      return "webp";
    case "image/svg+xml":
      return "svg";
    default:
      throw new Error("Formato de imagen no soportado. Usá PNG, JPG, WEBP o SVG.");
  }
}

async function uploadImageToStorage(file: File, filePath: string) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const supabase = await getServiceRoleClient();

  await ensureProductImageBucket();

  if (isSvgFile(file)) {
    const { error } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).upload(filePath, bytes, {
      upsert: true,
      contentType: "image/svg+xml",
      cacheControl: "31536000",
    });

    if (error) {
      throw new Error(`No se pudo subir la imagen SVG: ${error.message}`);
    }

    return;
  }

  const sharpModule = await import("sharp");
  const optimizedBuffer = await sharpModule.default(bytes)
    .rotate()
    .resize({
      width: PRODUCT_IMAGE_MAX_DIMENSION,
      height: PRODUCT_IMAGE_MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: PRODUCT_IMAGE_WEBP_QUALITY,
      effort: 4,
    })
    .toBuffer();

  const { error } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).upload(
    filePath,
    optimizedBuffer,
    {
      upsert: true,
      contentType: "image/webp",
      cacheControl: "31536000",
    },
  );

  if (error) {
    throw new Error(`No se pudo subir la imagen optimizada: ${error.message}`);
  }
}

function isSvgFile(file: File) {
  return file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
}

async function removeStoredImageAtPath(relativePath: string) {
  const storageObjectPath = getStorageObjectPath(relativePath);

  if (!storageObjectPath) {
    return;
  }

  const supabase = await getServiceRoleClient();
  const { error } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([storageObjectPath]);

  if (error && !error.message.toLowerCase().includes("not found")) {
    throw new Error(`No se pudo borrar la imagen anterior: ${error.message}`);
  }
}

async function ensureProductImageBucket() {
  const supabase = await getServiceRoleClient();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    throw new Error(`No se pudieron listar los buckets: ${listError.message}`);
  }

  if (buckets.some((bucket) => bucket.name === PRODUCT_IMAGE_BUCKET)) {
    return;
  }

  const { error: createError } = await supabase.storage.createBucket(PRODUCT_IMAGE_BUCKET, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"],
  });

  if (createError && !createError.message.toLowerCase().includes("already exists")) {
    throw new Error(`No se pudo crear el bucket de imágenes: ${createError.message}`);
  }
}

async function getServiceRoleClient() {
  const { createServiceRoleClient } = await import("@/lib/supabase/service");
  return createServiceRoleClient();
}

function buildStorageProxyPath(bucket: string, objectPath: string) {
  return `/storage/${bucket}/${objectPath}`;
}

function buildVersionedStorageObjectPath(
  prefix: string,
  baseName: string,
  extension: string,
) {
  const version = Date.now().toString(36);
  return `${prefix}/${baseName}-${version}.${extension}`;
}

function getStorageObjectPath(relativePath: string) {
  const prefix = `/storage/${PRODUCT_IMAGE_BUCKET}/`;

  if (!relativePath.startsWith(prefix)) {
    return null;
  }

  return relativePath.slice(prefix.length);
}

function readString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function readNullableNumber(value: FormDataEntryValue | null) {
  const stringValue = readString(value);

  if (!stringValue) {
    return null;
  }

  const parsed = Number.parseInt(stringValue, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function readBooleanFlag(value: FormDataEntryValue | null) {
  const stringValue = readString(value).toLowerCase();
  return stringValue === "1" || stringValue === "true" || stringValue === "on";
}

function parseTextAreaList(value: FormDataEntryValue | null) {
  return readString(value)
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function readNumberOrDefault(value: FormDataEntryValue | null, fallback: number) {
  const parsed = readNullableNumber(value);
  return parsed ?? fallback;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
