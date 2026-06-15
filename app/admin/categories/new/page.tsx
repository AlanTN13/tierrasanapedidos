import { Suspense } from "react";
import { connection } from "next/server";
import { CategoryForm } from "@/components/admin/category-form";
import { saveCategory } from "@/app/admin/actions";
import { requireAdminUser } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/admin/page-header";

export default function NewCategoryPage() {
  return (
    <Suspense fallback={<CategoryEditorFallback title="Nueva categoría" />}>
      <NewCategoryContent />
    </Suspense>
  );
}

async function NewCategoryContent() {
  await connection();
  await requireAdminUser();

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Nueva categoría"
        description="Definí el nombre visible, la imagen y el orden en catálogo."
      />
      <CategoryForm action={saveCategory} />
    </div>
  );
}

function CategoryEditorFallback({ title }: { title: string }) {
  return (
    <div className="max-w-5xl">
      <span className="section-kicker">Backoffice</span>
      <h1 className="mt-3 font-display text-4xl font-semibold text-olive-dark">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-foreground/66">Cargando formulario...</p>
    </div>
  );
}
