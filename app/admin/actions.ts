"use server";

import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { AdminInputError, productErrorResult, type AdminFormResult } from "@/lib/admin-form-result";
import { createClient } from "@/lib/supabase/server";
import { requireAdminUser } from "@/lib/supabase/admin";
import { refreshCatalogCache } from "@/lib/catalog-data";
import { getAdminHomeSettings, refreshHomeCache } from "@/lib/home-data";
import { saveHomeBannerCollection } from "@/lib/home-banner-save";
import { refreshRecipesCache } from "@/lib/recipes-data";
import { generateBaseSku, normalizeManualSku } from "@/lib/sku";
import { parsePresentations, validateProductIdentity } from "@/lib/product-form-validation";
import { isSupabaseConfigured } from "@/lib/supabase/config";


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

export async function saveProduct(formData: FormData): Promise<AdminFormResult | void> {
  // Authentication redirects remain framework control flow, outside error conversion.
  await requireAdminUser();
  let resolvedProductId = "";
  let imagePath = "";
  let previousImagePath = "";
  let hasWrittenProduct = false;
  let slug = "";

  try {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase no está configurado.");
    }

    const supabase = await createClient();
    const productId = readString(formData.get("productId"));
    resolvedProductId = productId;
    const name = readString(formData.get("name"));
    const submittedSlug = readString(formData.get("slug"));
    slug = slugify(submittedSlug || name);
    const baseSku = normalizeManualSku(readString(formData.get("baseSku"))) || generateBaseSku(slug, name);
    const description = readString(formData.get("description"));
    const existingImagePath = readString(formData.get("existingImagePath"));
    previousImagePath = existingImagePath;
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

    if (!slug || !name || !description) {
      throw new AdminInputError("Completá el slug, nombre y descripción del producto.", !slug ? "slug" : !name ? "name" : "description");
    }
    if (categoryIds.length === 0) {
      throw new AdminInputError("Elegí al menos una categoría para el producto.", "categoryIds");
    }
    if (presentations.length === 0) {
      throw new AdminInputError("Agregá al menos una presentación con contenido y precio.", "presentationPrice");
    }

    await validateProductIdentity(supabase, { productId, slug, baseSku, presentations });
    imagePath = await resolveProductImagePath({ slug, name, imageFile, existingImagePath, removeExistingImage });

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
          throw legacyError;
        }
      } else if (error) {
        throw error;
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
          throw legacyError ?? new Error("No se pudo crear el producto.");
        }

        resolvedProductId = legacyData.id;
      } else if (error || !data) {
        throw error ?? new Error("No se pudo crear el producto.");
      } else {
        resolvedProductId = data.id;
      }
    }

    hasWrittenProduct = true;

    const { data: existingPresentations, error: existingPresentationsError } = await supabase
      .from("product_presentations")
      .select("id")
      .eq("product_id", resolvedProductId);

    if (existingPresentationsError) {
      throw existingPresentationsError;
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
        throw error;
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
            throw legacyError;
          }
        } else if (error) {
          throw error;
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
            throw legacyError;
          }
        } else if (error) {
          throw error;
        }
      }
    }

    const { error: deleteCategoriesError } = await supabase
      .from("product_categories")
      .delete()
      .eq("product_id", resolvedProductId);

    if (deleteCategoriesError) {
      throw deleteCategoriesError;
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
      throw insertCategoriesError;
    }

    await refreshCatalogCache();
  } catch (error) {
    const result = productErrorResult(error);
    if (hasWrittenProduct && resolvedProductId) {
      // Multi-step saves can fail after the product exists. Reuse its ID on retry.
      result.resume = { productId: resolvedProductId, existingImagePath: imagePath };
      result.error += " Algunos cambios pueden haberse guardado; al corregir y guardar continuaremos sobre el mismo producto.";
    }
    if (!(error instanceof AdminInputError)) {
      result.reference = randomUUID().slice(0, 8);
      console.error("[admin:saveProduct]", { reference: result.reference, error });
    }
    return result;
  }

  // Never remove the previous image before the complete product save succeeds.
  if (previousImagePath && previousImagePath !== imagePath) {
    try {
      await removeStoredImageAtPath(previousImagePath);
    } catch (error) {
      console.error("[admin:saveProduct:image-cleanup]", error);
    }
  }
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

export async function saveHomeSettings(formData: FormData): Promise<AdminFormResult | void> {
  await requireAdminUser();
  try {
    const settings = await getAdminHomeSettings();
    if (!settings.carouselReady) {
      throw new AdminInputError("La carga de varios banners todavía no está habilitada. La portada actual sigue disponible.");
    }
    const supabase = await createClient();
    await saveHomeBannerCollection(formData, settings.banners, {
      upload: async (file, id, variant) => uploadHomeBanner({ imageFile: file, bannerId: id, variant }),
      persist: async (banners) => {
        const first = banners[0];
        const { error } = await supabase.from("home_settings").upsert({
          id: "main",
          hero_banners: banners,
          hero_banner_path: first.desktopPath,
          hero_banner_mobile_path: first.mobilePath,
          hero_banner_alt: first.alt,
        });
        if (error) throw error;
      },
    });
  } catch (error) {
    if (error instanceof AdminInputError) return { error: error.message, field: error.field };
    const reference = randomUUID().slice(0, 8);
    console.error("[admin:saveHomeSettings]", { reference, error });
    return { error: "No pudimos confirmar el guardado. Conservamos tus imágenes y el formulario; revisá la portada antes de volver a intentar.", reference };
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

async function uploadHomeBanner({
  imageFile,
  bannerId,
  variant,
}: {
  imageFile: File;
  bannerId: string;
  variant: "desktop" | "mobile";
}) {
  const extension = getOutputImageExtension(imageFile);
  const filePath = buildVersionedStorageObjectPath(
    HOME_IMAGE_PREFIX,
    `hero-${bannerId}-${variant}-${randomUUID()}`,
    extension,
  );
  await uploadImageToStorage(imageFile, filePath);
  return buildStorageProxyPath(PRODUCT_IMAGE_BUCKET, filePath);
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
