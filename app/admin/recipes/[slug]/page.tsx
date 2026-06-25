import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { saveRecipe } from "@/app/admin/recipes/actions";
import { RecipeForm } from "@/components/admin/recipe-form";
import { PageHeader } from "@/components/admin/page-header";
import {
  getAdminRecipeBySlug,
  getRecipeCategoryOptions,
  getRecipeProductOptions,
} from "@/lib/recipes-data";
import { requireAuthenticatedUser } from "@/lib/supabase/admin";

type EditRecipePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default function EditRecipePage({ params }: EditRecipePageProps) {
  return (
    <Suspense fallback={<EditRecipeFallback />}>
      <EditRecipeContent params={params} />
    </Suspense>
  );
}

async function EditRecipeContent({ params }: EditRecipePageProps) {
  await connection();
  await requireAuthenticatedUser("/admin/recipes");
  const { slug } = await params;
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
      <RecipeForm
        categories={categories}
        productOptions={productOptions}
        recipe={recipe}
        action={saveRecipe}
      />
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
