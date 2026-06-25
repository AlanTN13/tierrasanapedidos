import { Suspense } from "react";
import { connection } from "next/server";
import { saveRecipe } from "@/app/admin/actions";
import { RecipeForm } from "@/components/admin/recipe-form";
import { PageHeader } from "@/components/admin/page-header";
import { getRecipeCategoryOptions, getRecipeProductOptions } from "@/lib/recipes-data";
import { requireAuthenticatedUser } from "@/lib/supabase/admin";

export default function NewRecipePage() {
  return (
    <Suspense fallback={<RecipeEditorFallback title="Nueva receta" />}>
      <NewRecipeContent />
    </Suspense>
  );
}

async function NewRecipeContent() {
  await connection();
  await requireAuthenticatedUser("/admin/recipes/new");
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
