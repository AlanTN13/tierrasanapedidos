import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { AdminContentList } from "@/components/admin/content-list";
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
    <div className="space-y-4">
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
        <div className="rounded-lg border border-olive/12 bg-olive-soft/36 px-4 py-3 text-sm text-olive-dark">
          Receta borrada.
        </div>
      ) : null}

      <AdminContentList label="recetas" columns={["Categoría", "Productos", "Orden"]} rows={recipes.map((recipe)=>({
        id:recipe.id,title:recipe.title,slug:recipe.slug,description:recipe.shortDescription,active:recipe.isActive,href:`/admin/recipes/${recipe.slug}`,values:[recipe.targetCategory,String(recipe.productCount),String(recipe.sortOrder)],
      }))}/>

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
