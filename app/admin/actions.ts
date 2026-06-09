"use server";

import fs from "node:fs/promises";
import path from "node:path";
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
    return existingImagePath;
  }

  if (!(imageFile instanceof File) || imageFile.size === 0) {
    return existingImagePath;
  }

  const extension = getImageExtension(imageFile);
  const normalizedBaseName = slugify(slug || name);
  const fileName = `${normalizedBaseName}.${extension}`;
  const relativePath = `/productos/${fileName}`;
  const targetPath = path.join(process.cwd(), "public", "productos", fileName);

  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  const bytes = await imageFile.arrayBuffer();
  await fs.writeFile(targetPath, Buffer.from(bytes));

  return relativePath;
}

function getImageExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();

  if (fromName && ["png", "jpg", "jpeg", "webp", "svg"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }

  switch (file.type) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "image/svg+xml":
      return "svg";
    default:
      throw new Error("Formato de imagen no soportado. Usá PNG, JPG, WEBP o SVG.");
  }
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
