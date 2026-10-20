import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { AdminContentList } from "@/components/admin/content-list";
import { PageHeader } from "@/components/admin/page-header";
import { getAdminCategoryRecords } from "@/lib/catalog-data";
import { requireAdminUser } from "@/lib/supabase/admin";

export default function CategoriesPage() {
  return (
    <Suspense fallback={<CategoriesPageFallback />}>
      <CategoriesPageContent />
    </Suspense>
  );
}

async function CategoriesPageContent() {
  await connection();
  await requireAdminUser();
  const categories = await getAdminCategoryRecords();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Categorías"
        description="Gestioná nombres, orden, imagen y estado de cada categoría."
        actions={
          <Link
            href="/admin/categories/new"
            className="inline-flex items-center justify-center rounded-full bg-olive px-5 py-3 text-sm font-semibold text-white hover:bg-olive-dark"
          >
            Nueva categoría
          </Link>
        }
      />

      <AdminContentList label="categorías" columns={["Orden", "Imagen"]} rows={categories.map((category)=>({
        id:category.id,title:category.name,slug:category.slug,description:category.searchTags.length?`Tags: ${category.searchTags.join(", ")}`:"Sin tags de búsqueda cargados.",active:category.isActive,href:`/admin/categories/${category.id}`,values:[String(category.sortOrder),category.imagePath || "Sin imagen"],
      }))}/>

    </div>
  );
}

function CategoriesPageFallback() {
  return (
    <div>
      <span className="section-kicker">Backoffice</span>
      <h1 className="mt-3 font-display text-4xl font-semibold text-olive-dark">Categorías</h1>
      <p className="mt-2 text-sm leading-6 text-foreground/66">Cargando categorías...</p>
    </div>
  );
}
