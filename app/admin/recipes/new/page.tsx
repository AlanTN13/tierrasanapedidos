import { Suspense } from "react";
import { connection } from "next/server";
import { saveRecipe } from "@/app/admin/recipes/actions";
import { RecipeForm } from "@/components/admin/recipe-form";
import { PageHeader } from "@/components/admin/page-header";
import { getRecipeCategoryOptions, getRecipeProductOptions } from "@/app/admin/recipes/form-options";
import { requireAuthenticatedUser } from "@/lib/supabase/admin";

type NewRecipePageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default function NewRecipePage({ searchParams }: NewRecipePageProps) {
  return (
    <Suspense fallback={<RecipeEditorFallback title="Nueva receta" />}>
      <NewRecipeContent searchParams={searchParams} />
    </Suspense>
  );
}

async function NewRecipeContent({ searchParams }: NewRecipePageProps) {
  await connection();
  await requireAuthenticatedUser("/admin/recipes/new");
  const resolvedSearchParams = await searchParams;
  const [categories, productOptions] = await Promise.all([
    getRecipeCategoryOptions(),
    getRecipeProductOptions(),
  ]);

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Nueva receta"
        description="Cargá contenido, imagen principal y productos vinculados."
      />
      {resolvedSearchParams?.error ? (
        <div className="rounded-[1.4rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {resolvedSearchParams.error}
        </div>
      ) : null}
      <RecipeForm
        categories={categories}
        productOptions={productOptions}
        action={saveRecipe}
      />
    </div>
  );
}

function RecipeEditorFallback({ title }: { title: string }) {
  return (
    <div className="max-w-5xl">
      <span className="section-kicker">Backoffice</span>
      <h1 className="mt-3 font-display text-4xl font-semibold text-olive-dark">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-foreground/66">Cargando formulario...</p>
    </div>
  );
}
