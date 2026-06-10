"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdminUser } from "@/lib/supabase/admin";
import { refreshCatalogCache } from "@/lib/catalog-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type ParsedPresentation = {
  id: string | undefined;
  label: string;
  priceCents: number;
  sortOrder: number;
};

const PRODUCT_IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "svg"] as const;
const PRODUCT_IMAGE_MAX_DIMENSION = 1600;
const PRODUCT_IMAGE_WEBP_QUALITY = 82;
const PRODUCT_IMAGE_BUCKET = "product-images";
const PRODUCT_IMAGE_PREFIX = "products";
const PRODUCT_IMAGE_PLACEHOLDER = "/productos/frutos-secos-placeholder.svg";

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
  const slug = readString(formData.get("slug"));
  const name = readString(formData.get("name"));
  const description = readString(formData.get("description"));
  const existingImagePath = readString(formData.get("existingImagePath"));
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
  const presentations = parsePresentations(formData);
  const imagePath = await resolveProductImagePath({
    slug,
    name,
    imageFile,
    existingImagePath,
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
    const { error } = await supabase
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

    if (error) {
      throw new Error(error.message);
    }
  } else {
    const { data, error } = await supabase
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

    if (error || !data) {
      throw new Error(error?.message ?? "No se pudo crear el producto.");
    }

    resolvedProductId = data.id;
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
  const presentationIdsToDelete = existingPresentationIds.filter(
    (id) => !submittedPresentationIds.includes(id),
  );

  if (presentationIdsToDelete.length > 0) {
    const { error } = await supabase
      .from("product_presentations")
      .delete()
      .in("id", presentationIdsToDelete);

    if (error) {
      throw new Error(error.message);
    }
  }

  for (const presentation of presentations) {
    if (presentation.id) {
      const { error } = await supabase
        .from("product_presentations")
        .update({
          label: presentation.label,
          price_cents: presentation.priceCents,
          sort_order: presentation.sortOrder,
          is_active: true,
        })
        .eq("id", presentation.id);

      if (error) {
        throw new Error(error.message);
      }
    } else {
      const { error } = await supabase.from("product_presentations").insert({
        product_id: resolvedProductId,
        label: presentation.label,
        price_cents: presentation.priceCents,
        sort_order: presentation.sortOrder,
        is_active: true,
      });

      if (error) {
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

function parsePresentations(formData: FormData): ParsedPresentation[] {
  const ids = formData.getAll("presentationId").map((value) => readString(value));
  const labels = formData.getAll("presentationLabel").map((value) => readString(value));
  const prices = formData.getAll("presentationPrice").map((value) => readString(value));
  const sortOrders = formData
    .getAll("presentationSortOrder")
    .map((value) => readString(value));

  const parsedPresentations = labels
    .map((label, index) => {
      const price = prices[index] ?? "";

      if (!label || !price) {
        return null;
      }

      return {
        id: ids[index] || undefined,
        label,
        priceCents: parseCurrencyToCents(price),
        sortOrder: Number.parseInt(sortOrders[index] || String(index), 10) || index,
      };
    })
    .filter((value): value is ParsedPresentation => Boolean(value));

  return parsedPresentations;
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
}: {
  slug: string;
  name: string;
  imageFile: FormDataEntryValue | null;
  existingImagePath: string;
}) {
  if (!slug || !name) {
    return existingImagePath || PRODUCT_IMAGE_PLACEHOLDER;
  }

  if (!(imageFile instanceof File) || imageFile.size === 0) {
    return existingImagePath || PRODUCT_IMAGE_PLACEHOLDER;
  }

  const extension = getOutputImageExtension(imageFile);
  const normalizedBaseName = slugify(slug || name);
  const filePath = `${PRODUCT_IMAGE_PREFIX}/${normalizedBaseName}.${extension}`;
  const storagePath = buildStorageProxyPath(PRODUCT_IMAGE_BUCKET, filePath);

  await uploadProductImageToStorage(imageFile, filePath);
  await removeProductImageAtPath(existingImagePath);

  return storagePath;
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

async function uploadProductImageToStorage(
  file: File,
  filePath: string,
) {
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

async function removeProductImageAtPath(relativePath: string) {
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

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
