import { Suspense } from "react";
import { connection } from "next/server";
import { ProductForm } from "@/components/admin/product-form";
import { saveProduct } from "@/app/admin/actions";
import { getAdminCategories } from "@/lib/catalog-data";
import { requireAdminUser } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/admin/page-header";

export default function NewProductPage() {
  return (
    <Suspense fallback={<ProductEditorFallback title="Nuevo producto" />}>
      <NewProductContent />
    </Suspense>
  );
}

async function NewProductContent() {
  await connection();
  await requireAdminUser();
  const categories = await getAdminCategories();

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Nuevo producto"
        description="Cargá los datos base, categorías y presentaciones."
      />
      <ProductForm categories={categories} action={saveProduct} />
    </div>
  );
}

function ProductEditorFallback({ title }: { title: string }) {
  return (
    <div className="max-w-5xl">
      <span className="section-kicker">Backoffice</span>
      <h1 className="mt-3 font-display text-4xl font-semibold text-olive-dark">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-foreground/66">Cargando formulario...</p>
    </div>
  );
}
