import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { CategoryForm } from "@/components/admin/category-form";
import { saveCategory } from "@/app/admin/actions";
import { requireAdminUser } from "@/lib/supabase/admin";

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
    <main className="container-shell py-8 sm:py-10">
      <div className="max-w-5xl">
        <span className="section-kicker">Backoffice</span>
        <h1 className="mt-3 font-display text-4xl font-semibold text-olive-dark">
          Nueva categoría
        </h1>
        <p className="mt-2 text-sm leading-6 text-foreground/66">
          Definí el nombre visible, la imagen y el orden en catálogo.
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
          <CategoryForm action={saveCategory} />
        </div>
      </div>
    </main>
  );
}

function CategoryEditorFallback({ title }: { title: string }) {
  return (
    <main className="container-shell py-8 sm:py-10">
      <div className="max-w-5xl">
        <span className="section-kicker">Backoffice</span>
        <h1 className="mt-3 font-display text-4xl font-semibold text-olive-dark">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-foreground/66">
          Cargando formulario...
        </p>
      </div>
    </main>
  );
}
