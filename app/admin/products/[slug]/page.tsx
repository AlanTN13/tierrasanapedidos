import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ProductForm } from "@/components/admin/product-form";
import { saveProduct } from "@/app/admin/actions";
import { getAdminCategories, getAdminProductBySlug } from "@/lib/catalog-data";
import { requireAdminUser } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/admin/page-header";

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
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Editar producto"
        description="Ajustá precio, categorías, destacado o disponibilidad."
        actions={
          <Link
            href="/admin/products"
            className="inline-flex items-center justify-center rounded-full border border-olive/14 bg-white px-5 py-3 text-sm font-semibold text-olive-dark hover:bg-olive-soft/36"
          >
            Volver
          </Link>
        }
      />
      <ProductForm categories={categories} product={product} action={saveProduct} />
    </div>
  );
}

function EditProductFallback() {
  return (
    <div className="max-w-5xl">
      <span className="section-kicker">Backoffice</span>
      <h1 className="mt-3 font-display text-4xl font-semibold text-olive-dark">
        Editar producto
      </h1>
      <p className="mt-2 text-sm leading-6 text-foreground/66">Cargando formulario...</p>
    </div>
  );
}
