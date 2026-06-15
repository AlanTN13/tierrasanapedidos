import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { PageHeader } from "@/components/admin/page-header";
import { ProductsList } from "@/components/admin/products-list";
import { getAdminCategories, getAdminProducts } from "@/lib/catalog-data";
import { requireAdminUser } from "@/lib/supabase/admin";

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageFallback />}>
      <ProductsPageContent />
    </Suspense>
  );
}

async function ProductsPageContent() {
  await connection();
  await requireAdminUser();
  const [products, categories] = await Promise.all([getAdminProducts(), getAdminCategories()]);
  const categoryNameById = Object.fromEntries(
    categories.map((category) => [category.id, category.name]),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        description="Gestioná catálogo, presentaciones y visibilidad sin mezclarlo con compras o ventas."
        actions={
          <>
            <Link
              href="/admin/export"
              className="inline-flex items-center justify-center rounded-full border border-olive/14 bg-white px-4 py-2 text-sm font-semibold text-olive-dark hover:bg-olive-soft/36"
            >
              Exportar CSV
            </Link>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center justify-center rounded-full bg-olive px-4 py-2 text-sm font-semibold text-white hover:bg-olive-dark"
            >
              Nuevo producto
            </Link>
          </>
        }
      />

      <ProductsList products={products} categoryNameById={categoryNameById} />
    </div>
  );
}

function ProductsPageFallback() {
  return (
    <div>
      <span className="section-kicker">Backoffice</span>
      <h1 className="mt-3 font-display text-4xl font-semibold text-olive-dark">Productos</h1>
      <p className="mt-2 text-sm leading-6 text-foreground/66">Cargando productos...</p>
    </div>
  );
}
