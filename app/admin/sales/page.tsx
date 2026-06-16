import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { PageHeader } from "@/components/admin/page-header";
import { getSales } from "@/lib/admin-operations";
import { formatARS, formatDateTime } from "@/lib/format";
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

      <section className="surface-panel organic-outline overflow-hidden rounded-[2rem]">
        <div className="grid gap-px bg-olive/8">
          {sales.map((sale) => (
            <article
              key={sale.id}
              className="grid gap-4 bg-white/92 px-5 py-4 md:grid-cols-[minmax(0,1fr)_220px_150px]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-olive-dark">
                    {sale.saleCode}
                  </h2>
                  <span className="rounded-full bg-earth/10 px-2.5 py-1 text-[11px] font-semibold text-earth">
                    {sale.channel || "Sin nombre"}
                  </span>
                  {sale.hasNegativeStock ? (
                    <span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-700">
                      Stock base negativo
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-foreground/62">{formatDateTime(sale.soldAt)}</p>
                <p className="mt-3 text-sm leading-6 text-foreground/68">
                  {sale.notes || "Sin observaciones."}
                </p>
              </div>

              <div className="space-y-2 text-sm text-olive-dark">
                <div className="rounded-2xl border border-olive/10 bg-olive-soft/26 px-3 py-2">
                  <strong>Ítems</strong>
                  <div>{sale.itemCount}</div>
                </div>
                <div className="rounded-2xl border border-olive/10 bg-olive-soft/26 px-3 py-2">
                  <strong>Total</strong>
                  <div>{formatARS(sale.totalCents / 100)}</div>
                </div>
                <div className="rounded-2xl border border-olive/10 bg-olive-soft/26 px-3 py-2">
                  <strong>Margen</strong>
                  <div>{formatARS(sale.totalMarginCents / 100)}</div>
                </div>
              </div>

              <div className="flex items-start justify-start md:justify-end">
                <Link
                  href={`/admin/sales/${sale.id}`}
                  className="inline-flex items-center justify-center rounded-full border border-olive/14 bg-white px-4 py-2 text-sm font-semibold text-olive-dark hover:bg-olive-soft/36"
                >
                  Ver detalle
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
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
