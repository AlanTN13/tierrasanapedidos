import { Suspense } from "react";
import { connection } from "next/server";
import { ProductForm } from "@/components/admin/product-form";
import { saveProduct } from "@/app/admin/actions";
import { getAdminCategories } from "@/lib/catalog-data";
import { requireAdminUser } from "@/lib/supabase/admin";

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
    <main className="container-shell py-8 sm:py-10">
      <div className="max-w-5xl">
        <span className="section-kicker">Backoffice</span>
        <h1 className="mt-3 font-display text-4xl font-semibold text-olive-dark">
          Nuevo producto
        </h1>
        <p className="mt-2 text-sm leading-6 text-foreground/66">
          Cargá los datos base, categorías y presentaciones.
        </p>

        <div className="mt-6">
          <ProductForm categories={categories} action={saveProduct} />
        </div>
      </div>
    </main>
  );
}

function ProductEditorFallback({ title }: { title: string }) {
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
