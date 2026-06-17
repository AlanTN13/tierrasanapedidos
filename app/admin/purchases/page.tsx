import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { PurchasesOverview } from "@/components/admin/purchases-overview";
import { PageHeader } from "@/components/admin/page-header";
import { getPurchaseOrders } from "@/lib/admin-operations";
import { requireAdminUser } from "@/lib/supabase/admin";

export default function PurchasesPage() {
  return (
    <Suspense fallback={<PurchasesPageFallback />}>
      <PurchasesPageContent />
    </Suspense>
  );
}

async function PurchasesPageContent() {
  await connection();
  await requireAdminUser();
  const purchaseOrders = await getPurchaseOrders();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compras"
        description="Registrá órdenes de compra y sumá stock base real según gramos, ml o unidades."
        actions={
          <>
            <Link
              href="/admin/export/purchases"
              className="inline-flex items-center justify-center rounded-full border border-olive/14 bg-white px-5 py-3 text-sm font-semibold text-olive-dark hover:bg-olive-soft/36"
            >
              Exportar CSV
            </Link>
            <Link
              href="/admin/purchases/new"
              className="inline-flex items-center justify-center rounded-full bg-olive px-5 py-3 text-sm font-semibold text-white hover:bg-olive-dark"
            >
              Nueva compra
            </Link>
          </>
        }
      />
      <PurchasesOverview purchaseOrders={purchaseOrders} />
    </div>
  );
}

function PurchasesPageFallback() {
  return (
    <div>
      <span className="section-kicker">Backoffice</span>
      <h1 className="mt-3 font-display text-4xl font-semibold text-olive-dark">Compras</h1>
      <p className="mt-2 text-sm leading-6 text-foreground/66">Cargando compras...</p>
    </div>
  );
}
