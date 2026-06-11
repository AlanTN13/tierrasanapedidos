import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CategoryForm } from "@/components/admin/category-form";
import { saveCategory } from "@/app/admin/actions";
import { getAdminCategoryById } from "@/lib/catalog-data";
import { requireAdminUser } from "@/lib/supabase/admin";

type EditCategoryPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function EditCategoryPage({ params }: EditCategoryPageProps) {
  return (
    <Suspense fallback={<CategoryEditorFallback />}>
      <EditCategoryContent params={params} />
    </Suspense>
  );
}

async function EditCategoryContent({ params }: EditCategoryPageProps) {
  await connection();
  await requireAdminUser();
  const { id } = await params;
  const category = await getAdminCategoryById(id);

  if (!category) {
    notFound();
  }

  return (
    <main className="container-shell py-8 sm:py-10">
      <div className="max-w-5xl">
        <span className="section-kicker">Backoffice</span>
        <h1 className="mt-3 font-display text-4xl font-semibold text-olive-dark">
          Editar categoría
        </h1>
        <p className="mt-2 text-sm leading-6 text-foreground/66">
          Ajustá nombre, slug, orden e imagen visible.
        </p>

        <div className="mt-4">
          <Link
            href="/admin/categories"
            className="inline-flex items-center justify-center rounded-full border border-olive/14 bg-white px-4 py-2 text-sm font-semibold text-olive-dark hover:bg-olive-soft/36"
          >
            Volver a categorías
          </Link>
        </div>

        <div className="mt-6">
          <CategoryForm category={category} action={saveCategory} />
        </div>
      </div>
    </main>
  );
}

function CategoryEditorFallback() {
  return (
    <main className="container-shell py-8 sm:py-10">
      <div className="max-w-5xl">
        <span className="section-kicker">Backoffice</span>
        <h1 className="mt-3 font-display text-4xl font-semibold text-olive-dark">
          Editar categoría
        </h1>
        <p className="mt-2 text-sm leading-6 text-foreground/66">
          Cargando formulario...
        </p>
      </div>
    </main>
  );
}
