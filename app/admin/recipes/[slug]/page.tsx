import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { deleteRecipe, saveRecipe } from "@/app/admin/recipes/actions";
import { getRecipeCategoryOptions, getRecipeProductOptions } from "@/app/admin/recipes/form-options";
import { DeleteRecordButton } from "@/components/admin/delete-record-button";
import { RecipeForm } from "@/components/admin/recipe-form";
import { PageHeader } from "@/components/admin/page-header";
import {
  getAdminRecipeBySlug,
} from "@/lib/recipes-data";
import { requireAdminUser } from "@/lib/supabase/admin";

type EditRecipePageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export default function EditRecipePage({ params, searchParams }: EditRecipePageProps) {
  return (
    <Suspense fallback={<EditRecipeFallback />}>
      <EditRecipeContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function EditRecipeContent({ params, searchParams }: EditRecipePageProps) {
  await connection();
  await requireAdminUser();
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const [categories, productOptions, recipe] = await Promise.all([
    getRecipeCategoryOptions(),
    getRecipeProductOptions(),
    getAdminRecipeBySlug(slug),
  ]);

  if (!recipe) {
    notFound();
  }

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Editar receta"
        description="Ajustá el contenido, la imagen y los productos sugeridos."
        actions={
          <Link
            href="/admin/recipes"
            className="inline-flex items-center justify-center rounded-full border border-olive/14 bg-white px-5 py-3 text-sm font-semibold text-olive-dark hover:bg-olive-soft/36"
          >
            Volver
          </Link>
        }
      />
      {resolvedSearchParams?.error ? (
        <div className="rounded-[1.4rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {resolvedSearchParams.error}
        </div>
      ) : null}
      {resolvedSearchParams?.saved === "1" ? (
        <div className="rounded-[1.4rem] border border-olive/12 bg-olive-soft/36 px-4 py-3 text-sm text-olive-dark">
          Receta guardada.
        </div>
      ) : null}
      <RecipeForm
        categories={categories}
        productOptions={productOptions}
        recipe={recipe}
        action={saveRecipe}
      />
      <section className="surface-panel organic-outline rounded-[1.8rem] p-5">
        <h2 className="text-xl font-semibold text-olive-dark">Zona sensible</h2>
        <p className="mt-2 text-sm leading-6 text-foreground/64">
          Si esta receta es de prueba o ya no tiene que estar publicada, podés borrarla desde acá.
        </p>
        <div className="mt-4">
          <DeleteRecordButton
            action={deleteRecipe}
            recordId={recipe.id}
            recordLabel="receta"
            submitLabel="Borrar receta"
            confirmMessage={`Vas a borrar la receta ${recipe.title}. Esta acción no se puede deshacer.`}
          />
        </div>
      </section>
    </div>
  );
}

function EditRecipeFallback() {
  return (
    <div className="max-w-5xl">
      <span className="section-kicker">Backoffice</span>
      <h1 className="mt-3 font-display text-4xl font-semibold text-olive-dark">
        Editar receta
      </h1>
      <p className="mt-2 text-sm leading-6 text-foreground/66">Cargando formulario...</p>
    </div>
  );
}
