import { formatAdminDateTime as formatDateTime } from "@/lib/admin-display";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { DeleteRecordButton } from "@/components/admin/delete-record-button";
import { costState, COST_LABELS } from "@/lib/admin-display";
import { PageHeader } from "@/components/admin/page-header";
import { deleteSale } from "@/app/admin/operations/actions";
import { getSaleById } from "@/lib/admin-operations";
import {formatARS, formatQuantity} from "@/lib/format";
import { requireAdminUser } from "@/lib/supabase/admin";

type SaleDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function SaleDetailPage({ params }: SaleDetailPageProps) {
  return (
    <Suspense fallback={<SaleDetailFallback />}>
      <SaleDetailContent params={params} />
    </Suspense>
  );
}

async function SaleDetailContent({ params }: SaleDetailPageProps) {
  await connection();
  await requireAdminUser();
  const { id } = await params;
  const sale = await getSaleById(id);

  if (!sale) {
    notFound();
  }

  const quality = costState(sale.items);

  return (
    <div className="space-y-4">
      <PageHeader
        kicker="Venta"
        title={sale.saleCode}
        description={`${formatDateTime(sale.soldAt)}${sale.channel ? ` · ${sale.channel}` : ""}`}
        actions={
          <>
            <Link
              href="/admin/sales"
              className="inline-flex items-center justify-center rounded-full border border-olive/14 bg-white px-5 py-3 text-sm font-semibold text-olive-dark hover:bg-olive-soft/36"
            >
              Volver
            </Link>
            <Link
              href="/admin/sales/new"
              className="inline-flex items-center justify-center rounded-full bg-olive px-5 py-3 text-sm font-semibold text-white hover:bg-olive-dark"
            >
              Nueva venta
            </Link>
            <DeleteRecordButton
              action={deleteSale}
              recordId={sale.id}
              recordLabel="venta"
              submitLabel="Borrar venta"
              confirmMessage={`Vas a borrar la venta ${sale.saleCode}. Esta acción no se puede deshacer.`}
            />
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-4">
        <InfoCard label="Código" value={sale.saleCode} />
        <InfoCard label="Total" value={formatARS(sale.totalCents / 100)} />
        <InfoCard label="Margen bruto estimado" value={quality === "missing" ? "No concluyente" : formatARS(sale.totalMarginCents / 100)} />
        <InfoCard
          label="Stock"
          value={sale.hasNegativeStock ? "Hay productos en negativo" : "Sin alertas"}
        />
      </section>

      <section className="surface-panel organic-outline overflow-hidden rounded-xl">
        <div className="grid gap-px bg-olive/8">
          {sale.items.map((item) => (
            <article
              key={item.id}
              className="grid gap-4 bg-white/92 px-5 py-4 md:grid-cols-[minmax(0,1fr)_140px_150px_150px_150px]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-olive-dark">{item.productName}</h2>
                  {item.hasNegativeStock ? (
                    <span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-700">
                      Stock base negativo
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-foreground/62">{item.presentationLabel}</p>
                <p className="mt-3 text-sm text-foreground/66">
                  Stock base actual: {item.stockCurrentBaseLabel}
                </p>
              </div>
              <MiniInfo label="Presentaciones" value={formatQuantity(item.quantity)} />
              <MiniInfo label="Precio" value={formatARS(item.unitPriceCents / 100)} />
              <MiniInfo
                label={COST_LABELS[costState([item])]}
                value={costState([item]) === "missing" ? "Sin costo confirmado" : formatARS(item.unitCostSnapshotCents / 100)}
              />
              <MiniInfo label="Margen estimado" value={costState([item]) === "missing" ? "—" : formatARS(item.lineMarginCents / 100)} />
            </article>
          ))}
        </div>
      </section>

      {quality === "missing" ? <p className="admin-notice">Hay ítems sin costo confirmado. El margen total no es concluyente; no se interpreta ese faltante como costo cero.</p> : null}

      {sale.items.some((item) => item.usesEstimatedCost) ? (
        <section className="surface-panel organic-outline rounded-xl p-5">
          <p className="text-sm leading-6 text-foreground/68">
            Algunos items no tenían costo guardado al momento de crear la venta. Para esos casos,
            el margen se muestra con el último costo disponible en compras.
          </p>
        </section>
      ) : null}

      {sale.notes ? (
        <section className="surface-panel organic-outline rounded-xl p-5">
          <p className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">Notas</p>
          <p className="mt-3 text-sm leading-6 text-foreground/68">{sale.notes}</p>
        </section>
      ) : null}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-panel organic-outline rounded-xl p-5">
      <p className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-olive-dark">{value}</p>
    </div>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-olive/10 bg-olive-soft/26 px-3 py-2 text-sm text-olive-dark">
      <strong>{label}</strong>
      <div>{value}</div>
    </div>
  );
}

function SaleDetailFallback() {
  return (
    <div>
      <span className="section-kicker">Venta</span>
      <h1 className="mt-3 font-display text-4xl font-semibold text-olive-dark">Cargando detalle</h1>
    </div>
  );
}
