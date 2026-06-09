import { NextResponse } from "next/server";
import { getAdminCategories, getAdminProducts } from "@/lib/catalog-data";
import { requireAdminUser } from "@/lib/supabase/admin";

export async function GET() {
  await requireAdminUser();

  const [products, categories] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
  ]);
  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));

  const header = [
    "slug",
    "nombre",
    "descripcion",
    "imagen",
    "tags",
    "destacado",
    "orden_destacado",
    "activo",
    "categorias",
    "presentaciones",
  ];

  const rows = products.map((product) => [
    product.slug,
    product.name,
    product.description,
    product.imagePath,
    product.tags.join(" | "),
    product.isFeatured ? "si" : "no",
    product.featuredOrder ?? "",
    product.isActive ? "si" : "no",
    product.categoryIds
      .map((categoryId) => categoryNameById.get(categoryId) ?? categoryId)
      .join(" | "),
    product.presentations
      .map(
        (presentation) =>
          `${presentation.etiqueta}: ${presentation.precio.toLocaleString("es-AR")}`,
      )
      .join(" | "),
  ]);

  const csv = [header, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="catalogo-tierra-sana.csv"',
    },
  });
}

function escapeCsvCell(value: string | number) {
  const serialized = String(value ?? "");
  const escaped = serialized.replace(/"/g, '""');
  return `"${escaped}"`;
}
