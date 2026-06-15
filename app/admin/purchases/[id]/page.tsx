import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { PageHeader } from "@/components/admin/page-header";
import { getPurchaseOrderById } from "@/lib/admin-operations";
import { formatARS, formatDateTime, formatQuantity } from "@/lib/format";
import { requireAdminUser } from "@/lib/supabase/admin";

type PurchaseDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function PurchaseDetailPage({ params }: PurchaseDetailPageProps) {
  return (
    <Suspense fallback={<PurchaseDetailFallback />}>
      <PurchaseDetailContent params={params} />
    </Suspense>
  );
}

async function PurchaseDetailContent({ params }: PurchaseDetailPageProps) {
  await connection();
  await requireAdminUser();
  const { id } = await params;
  const purchaseOrder = await getPurchaseOrderById(id);

  if (!purchaseOrder) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Compra"
        title={purchaseOrder.supplierName}
        description={formatDateTime(purchaseOrder.purchasedAt)}
        actions={
          <Link
            href="/admin/purchases/new"
            className="inline-flex items-center justify-center rounded-full bg-olive px-5 py-3 text-sm font-semibold text-white hover:bg-olive-dark"
          >
            Nueva compra
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Total" value={formatARS(purchaseOrder.totalCents / 100)} />
        <InfoCard label="Ítems" value={String(purchaseOrder.itemCount)} />
        <InfoCard label="Comprobante" value={purchaseOrder.referenceNumber || "Sin número"} />
      </section>

      <section className="surface-panel organic-outline overflow-hidden rounded-[2rem]">
        <div className="grid gap-px bg-olive/8">
          {purchaseOrder.items.map((item) => (
            <article
              key={item.id}
              className="grid gap-4 bg-white/92 px-5 py-4 md:grid-cols-[minmax(0,1fr)_160px_160px_160px]"
            >
              <div>
                <h2 className="text-lg font-semibold text-olive-dark">{item.productName}</h2>
                <p className="mt-1 text-sm text-foreground/62">{item.presentationLabel}</p>
              </div>
              <MiniInfo label="Presentaciones" value={formatQuantity(item.quantity)} />
              <MiniInfo label="Costo unitario" value={formatARS(item.unitCostCents / 100)} />
              <MiniInfo label="Total línea" value={formatARS(item.lineTotalCents / 100)} />
            </article>
          ))}
        </div>
      </section>

      {purchaseOrder.notes ? (
        <section className="surface-panel organic-outline rounded-[1.8rem] p-5">
          <p className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">Notas</p>
          <p className="mt-3 text-sm leading-6 text-foreground/68">{purchaseOrder.notes}</p>
        </section>
      ) : null}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-panel organic-outline rounded-[1.8rem] p-5">
      <p className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-olive-dark">{value}</p>
    </div>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-olive/10 bg-olive-soft/26 px-3 py-2 text-sm text-olive-dark">
      <strong>{label}</strong>
      <div>{value}</div>
    </div>
  );
}

function PurchaseDetailFallback() {
  return (
    <div>
      <span className="section-kicker">Compra</span>
      <h1 className="mt-3 font-display text-4xl font-semibold text-olive-dark">Cargando detalle</h1>
    </div>
  );
}
