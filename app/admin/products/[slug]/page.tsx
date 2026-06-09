import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ProductForm } from "@/components/admin/product-form";
import { saveProduct } from "@/app/admin/actions";
import { getAdminCategories, getAdminProductBySlug } from "@/lib/catalog-data";
import { requireAdminUser } from "@/lib/supabase/admin";

type EditProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default function EditProductPage({ params }: EditProductPageProps) {
  return (
    <Suspense fallback={<EditProductFallback />}>
      <EditProductContent params={params} />
    </Suspense>
  );
}

async function EditProductContent({ params }: EditProductPageProps) {
  await connection();
  await requireAdminUser();
  const { slug } = await params;
  const [categories, product] = await Promise.all([
    getAdminCategories(),
    getAdminProductBySlug(slug),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <main className="container-shell py-8 sm:py-10">
      <div className="max-w-5xl">
        <span className="section-kicker">Backoffice</span>
        <h1 className="mt-3 font-display text-4xl font-semibold text-olive-dark">
          Editar producto
        </h1>
        <p className="mt-2 text-sm leading-6 text-foreground/66">
          Ajustá precio, categorías, destacado o disponibilidad.
        </p>

        <div className="mt-6">
          <ProductForm categories={categories} product={product} action={saveProduct} />
        </div>
      </div>
    </main>
  );
}

function EditProductFallback() {
  return (
    <main className="container-shell py-8 sm:py-10">
      <div className="max-w-5xl">
        <span className="section-kicker">Backoffice</span>
        <h1 className="mt-3 font-display text-4xl font-semibold text-olive-dark">
          Editar producto
        </h1>
        <p className="mt-2 text-sm leading-6 text-foreground/66">
          Cargando formulario...
        </p>
      </div>
    </main>
  );
}
