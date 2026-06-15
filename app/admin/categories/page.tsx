import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
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
    <div className="space-y-6">
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

      <section className="surface-panel organic-outline overflow-hidden rounded-[2rem]">
        <div className="grid gap-px bg-olive/8">
          {categories.map((category) => (
            <article
              key={category.id}
              className="grid gap-4 bg-white/92 px-5 py-4 md:grid-cols-[minmax(0,1fr)_220px_150px]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-olive-dark">{category.name}</h2>
                  {!category.isActive ? (
                    <span className="rounded-full bg-foreground/8 px-2.5 py-1 text-[11px] font-semibold text-foreground/72">
                      Inactiva
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-foreground/62">/{category.slug}</p>
                <p className="mt-3 text-sm leading-6 text-foreground/68">
                  {category.searchTags.length > 0
                    ? `Tags: ${category.searchTags.join(", ")}`
                    : "Sin tags de búsqueda cargados."}
                </p>
              </div>

              <div className="space-y-2 text-sm text-olive-dark">
                <div className="rounded-2xl border border-olive/10 bg-olive-soft/26 px-3 py-2">
                  <strong>Orden</strong>
                  <div>{category.sortOrder}</div>
                </div>
                <div className="rounded-2xl border border-olive/10 bg-olive-soft/26 px-3 py-2">
                  <strong>Imagen</strong>
                  <div className="truncate">{category.imagePath}</div>
                </div>
              </div>

              <div className="flex items-start justify-start md:justify-end">
                <Link
                  href={`/admin/categories/${category.id}`}
                  className="inline-flex items-center justify-center rounded-full border border-olive/14 bg-white px-4 py-2 text-sm font-semibold text-olive-dark hover:bg-olive-soft/36"
                >
                  Editar
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
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
