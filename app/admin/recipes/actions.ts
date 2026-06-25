"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuthenticatedUser } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const PRODUCT_IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "svg"] as const;
const PRODUCT_IMAGE_MAX_DIMENSION = 1600;
const PRODUCT_IMAGE_WEBP_QUALITY = 82;
const PRODUCT_IMAGE_BUCKET = "product-images";
const RECIPE_IMAGE_PREFIX = "recipes";
const RECIPE_IMAGE_PLACEHOLDER = "/recetas/trufas-fit.webp";

export async function saveRecipe(formData: FormData) {
  await requireAuthenticatedUser("/admin/recipes");

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
  let resolvedRecipeId = recipeId;

  try {
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
  } catch (error) {
    redirect(buildRecipeErrorRedirectPath({ recipeId: resolvedRecipeId, slug, error }));
  }

  revalidateTag("recipes", "max");
  revalidateTag("home", "max");
  redirect(`/admin/recipes/${slug}?saved=1`);
}

function buildRecipeErrorRedirectPath({
  recipeId,
  slug,
  error,
}: {
  recipeId: string;
  slug: string;
  error: unknown;
}) {
  const searchParams = new URLSearchParams();
  searchParams.set("error", getErrorMessage(error));

  if (recipeId && slug) {
    return `/admin/recipes/${slug}?${searchParams.toString()}`;
  }

  return `/admin/recipes/new?${searchParams.toString()}`;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "No se pudo guardar la receta.";
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

function getOutputImageExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();

  if (
    fromName &&
    PRODUCT_IMAGE_EXTENSIONS.includes(fromName as (typeof PRODUCT_IMAGE_EXTENSIONS)[number])
  ) {
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
