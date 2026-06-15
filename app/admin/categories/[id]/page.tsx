import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CategoryForm } from "@/components/admin/category-form";
import { saveCategory } from "@/app/admin/actions";
import { getAdminCategoryById } from "@/lib/catalog-data";
import { requireAdminUser } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/admin/page-header";

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
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Editar categoría"
        description="Ajustá nombre, slug, orden e imagen visible."
      />
      <CategoryForm category={category} action={saveCategory} />
    </div>
  );
}

function CategoryEditorFallback() {
  return (
    <div className="max-w-5xl">
      <span className="section-kicker">Backoffice</span>
      <h1 className="mt-3 font-display text-4xl font-semibold text-olive-dark">
        Editar categoría
      </h1>
      <p className="mt-2 text-sm leading-6 text-foreground/66">Cargando formulario...</p>
    </div>
  );
}
