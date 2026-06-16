import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { PageHeader } from "@/components/admin/page-header";
import { getPurchaseOrders } from "@/lib/admin-operations";
import { formatARS, formatDateTime } from "@/lib/format";
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

      <section className="surface-panel organic-outline overflow-hidden rounded-[2rem]">
        <div className="grid gap-px bg-olive/8">
          {purchaseOrders.map((order) => (
            <article
              key={order.id}
              className="grid gap-4 bg-white/92 px-5 py-4 md:grid-cols-[minmax(0,1fr)_200px_150px]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-olive-dark">{order.supplierName}</h2>
                  {order.referenceNumber ? (
                    <span className="rounded-full bg-earth/10 px-2.5 py-1 text-[11px] font-semibold text-earth">
                      {order.referenceNumber}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-foreground/62">{formatDateTime(order.purchasedAt)}</p>
                <p className="mt-3 text-sm leading-6 text-foreground/68">
                  {order.notes || "Sin observaciones."}
                </p>
              </div>

              <div className="space-y-2 text-sm text-olive-dark">
                <div className="rounded-2xl border border-olive/10 bg-olive-soft/26 px-3 py-2">
                  <strong>Total</strong>
                  <div>{formatARS(order.totalCents / 100)}</div>
                </div>
                <div className="rounded-2xl border border-olive/10 bg-olive-soft/26 px-3 py-2">
                  <strong>Ítems</strong>
                  <div>{order.itemCount}</div>
                </div>
              </div>

              <div className="flex items-start justify-start md:justify-end">
                <Link
                  href={`/admin/purchases/${order.id}`}
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

function PurchasesPageFallback() {
  return (
    <div>
      <span className="section-kicker">Backoffice</span>
      <h1 className="mt-3 font-display text-4xl font-semibold text-olive-dark">Compras</h1>
      <p className="mt-2 text-sm leading-6 text-foreground/66">Cargando compras...</p>
    </div>
  );
}
