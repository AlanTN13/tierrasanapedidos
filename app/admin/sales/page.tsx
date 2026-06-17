import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { SalesOverview } from "@/components/admin/sales-overview";
import { PageHeader } from "@/components/admin/page-header";
import { getSales } from "@/lib/admin-operations";
import { requireAdminUser } from "@/lib/supabase/admin";

export default function SalesPage() {
  return (
    <Suspense fallback={<SalesPageFallback />}>
      <SalesPageContent />
    </Suspense>
  );
}

async function SalesPageContent() {
  await connection();
  await requireAdminUser();
  const sales = await getSales();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ventas"
        description={`${sales.length} ventas registradas. Guardá ventas, medí margen y descontá stock base real aunque vendas por presentación.`}
        actions={
          <>
            <Link
              href="/admin/export/sales"
              className="inline-flex items-center justify-center rounded-full border border-olive/14 bg-white px-5 py-3 text-sm font-semibold text-olive-dark hover:bg-olive-soft/36"
            >
              Exportar CSV
            </Link>
            <Link
              href="/admin/sales/new"
              className="inline-flex items-center justify-center rounded-full bg-olive px-5 py-3 text-sm font-semibold text-white hover:bg-olive-dark"
            >
              Nueva venta
            </Link>
          </>
        }
      />
      <SalesOverview sales={sales} />
    </div>
  );
}

function SalesPageFallback() {
  return (
    <div>
      <span className="section-kicker">Backoffice</span>
      <h1 className="mt-3 font-display text-4xl font-semibold text-olive-dark">Ventas</h1>
      <p className="mt-2 text-sm leading-6 text-foreground/66">Cargando ventas...</p>
    </div>
  );
}
