import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { PageHeader } from "@/components/admin/page-header";
import { getAdminRecipeRecords } from "@/lib/recipes-data";
import { requireAdminUser } from "@/lib/supabase/admin";

type RecipesPageProps = {
  searchParams?: Promise<{
    deleted?: string;
  }>;
};

export default function RecipesPage({ searchParams }: RecipesPageProps) {
  return (
    <Suspense fallback={<RecipesPageFallback />}>
      <RecipesPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function RecipesPageContent({ searchParams }: RecipesPageProps) {
  await connection();
  await requireAdminUser();
  const resolvedSearchParams = await searchParams;
  const recipes = await getAdminRecipeRecords();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recetas"
        description="Gestioná recetas, imágenes, orden y productos sugeridos desde el backoffice."
        actions={
          <Link
            href="/admin/recipes/new"
            className="inline-flex items-center justify-center rounded-full bg-olive px-5 py-3 text-sm font-semibold text-white hover:bg-olive-dark"
          >
            Nueva receta
          </Link>
        }
      />

      {resolvedSearchParams?.deleted === "1" ? (
        <div className="rounded-[1.4rem] border border-olive/12 bg-olive-soft/36 px-4 py-3 text-sm text-olive-dark">
          Receta borrada.
        </div>
      ) : null}

      <section className="surface-panel organic-outline overflow-hidden rounded-[2rem]">
        <div className="grid gap-px bg-olive/8">
          {recipes.map((recipe) => (
            <article
              key={recipe.id}
              className="grid gap-4 bg-white/92 px-5 py-4 md:grid-cols-[minmax(0,1fr)_220px_150px]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-olive-dark">{recipe.title}</h2>
                  {!recipe.isActive ? (
                    <span className="rounded-full bg-foreground/8 px-2.5 py-1 text-[11px] font-semibold text-foreground/72">
                      Inactiva
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-foreground/62">/{recipe.slug}</p>
                <p className="mt-3 text-sm leading-6 text-foreground/68">
                  {recipe.shortDescription}
                </p>
              </div>

              <div className="space-y-2 text-sm text-olive-dark">
                <div className="rounded-2xl border border-olive/10 bg-olive-soft/26 px-3 py-2">
                  <strong>Categoría</strong>
                  <div>{recipe.targetCategory}</div>
                </div>
                <div className="rounded-2xl border border-olive/10 bg-olive-soft/26 px-3 py-2">
                  <strong>Productos</strong>
                  <div>{recipe.productCount}</div>
                </div>
                <div className="rounded-2xl border border-olive/10 bg-olive-soft/26 px-3 py-2">
                  <strong>Orden</strong>
                  <div>{recipe.sortOrder}</div>
                </div>
              </div>

              <div className="flex items-start justify-start md:justify-end">
                <Link
                  href={`/admin/recipes/${recipe.slug}`}
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

function RecipesPageFallback() {
  return (
    <div>
      <span className="section-kicker">Backoffice</span>
      <h1 className="mt-3 font-display text-4xl font-semibold text-olive-dark">Recetas</h1>
      <p className="mt-2 text-sm leading-6 text-foreground/66">Cargando recetas...</p>
    </div>
  );
}
