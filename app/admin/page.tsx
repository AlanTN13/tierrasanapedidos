import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { PageHeader } from "@/components/admin/page-header";
import { getAdminDashboardMetrics, getInventorySummary } from "@/lib/admin-operations";
import { getAdminCategories, getAdminProducts } from "@/lib/catalog-data";
import { formatARS, formatQuantity } from "@/lib/format";
import { requireAdminUser } from "@/lib/supabase/admin";

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminPageFallback />}>
      <AdminPageContent />
    </Suspense>
  );
}

async function AdminPageContent() {
  await connection();
  const admin = await requireAdminUser();
  const [products, categories, metrics, inventorySummary] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
    getAdminDashboardMetrics(),
    getInventorySummary(),
  ]);
  const stockAlerts = inventorySummary.slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resumen operativo"
        description={`Sesión iniciada como ${admin.email}. Este panel separa catálogo, compras y ventas para que el backoffice sea más claro y más fácil de operar.`}
        actions={
          <>
            <Link
              href="/admin/purchases/new"
              className="inline-flex items-center justify-center rounded-full border border-olive/14 bg-white px-5 py-3 text-sm font-semibold text-olive-dark hover:bg-olive-soft/36"
            >
              Nueva compra
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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Productos" value={String(products.length)} description="Catálogo activo e inactivo." />
        <MetricCard label="Categorías" value={String(categories.length)} description="Rutas de organización del surtido." />
        <MetricCard
          label={`Compras (${metrics.periodDays} días)`}
          value={formatARS(metrics.purchasesTotalCents / 100)}
          description="Total registrado en órdenes de compra."
        />
        <MetricCard
          label={`Ventas (${metrics.periodDays} días)`}
          value={formatARS(metrics.salesTotalCents / 100)}
          description={`Margen estimado: ${formatARS(metrics.salesMarginCents / 100)}.`}
        />
        <MetricCard
          label="Stock bajo"
          value={String(metrics.stockLowCount)}
          description="Presentaciones con stock menor o igual a 3."
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="surface-panel organic-outline rounded-[2rem] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-olive-dark">Ventas recientes</h2>
              <p className="text-sm text-foreground/64">
                Tickets guardados con total y margen.
              </p>
            </div>
            <Link
              href="/admin/sales/new"
              className="inline-flex items-center justify-center rounded-full bg-olive px-4 py-2 text-sm font-semibold text-white hover:bg-olive-dark"
            >
              Nueva venta
            </Link>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {metrics.recentSales.length > 0 ? (
              metrics.recentSales.map((sale) => (
                <Link
                  key={sale.id}
                  href={`/admin/sales/${sale.id}`}
                  className="block rounded-2xl border border-olive/10 bg-white/92 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-olive-dark">
                        Ticket {sale.id.slice(0, 8)}
                      </div>
                      <div className="text-sm text-foreground/68">{formatDateLabel(sale.soldAt)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-olive-dark">
                        {formatARS(sale.totalCents / 100)}
                      </div>
                      <div className="text-sm text-foreground/68">
                        Margen {formatARS(sale.totalMarginCents / 100)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyCard text="Todavía no hay tickets cargados." />
            )}
          </div>
        </div>

        <div className="surface-panel organic-outline rounded-[2rem] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-olive-dark">Mayor rotación</h2>
              <p className="text-sm text-foreground/64">
                Presentaciones más vendidas en los últimos {metrics.periodDays} días.
              </p>
            </div>
            <Link
              href="/admin/sales"
              className="inline-flex items-center justify-center rounded-full border border-olive/14 bg-white px-4 py-2 text-sm font-semibold text-olive-dark hover:bg-olive-soft/36"
            >
              Ver módulo
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {metrics.topRotationProducts.length > 0 ? (
              metrics.topRotationProducts.map((item) => (
                <div
                  key={item.productPresentationId}
                  className="flex items-center justify-between rounded-2xl border border-olive/10 bg-white/92 px-4 py-3"
                >
                  <div className="text-sm font-semibold text-olive-dark">{item.name}</div>
                  <div className="text-sm text-foreground/68">
                    {formatQuantity(item.quantitySold)} presentaciones
                  </div>
                </div>
              ))
            ) : (
              <EmptyCard text="Todavía no hay ventas cargadas en el período." />
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="surface-panel organic-outline rounded-[2rem] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-olive-dark">Alertas de stock</h2>
              <p className="text-sm text-foreground/64">
                Reposición sugerida según movimientos cargados.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {stockAlerts.length > 0 ? (
              stockAlerts.map((item) => (
                <div
                  key={item.productPresentationId}
                  className="rounded-2xl border border-olive/10 bg-white/92 px-4 py-3"
                >
                  <div className="text-sm font-semibold text-olive-dark">
                    {item.productName} - {item.presentationLabel}
                  </div>
                  <div className="mt-1 text-sm text-foreground/68">
                    Stock: {formatQuantity(item.stockCurrent)}
                  </div>
                </div>
              ))
            ) : (
              <EmptyCard text="Cuando empieces a cargar compras y ventas, acá vas a ver alertas reales." />
            )}
          </div>
        </div>

        <div className="surface-panel organic-outline rounded-[2rem] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-olive-dark">Compras recientes</h2>
              <p className="text-sm text-foreground/64">
                Últimas órdenes registradas en el backoffice.
              </p>
            </div>
            <Link
              href="/admin/purchases/new"
              className="inline-flex items-center justify-center rounded-full bg-olive px-4 py-2 text-sm font-semibold text-white hover:bg-olive-dark"
            >
              Nueva compra
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {metrics.recentPurchases.length > 0 ? (
              metrics.recentPurchases.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/purchases/${order.id}`}
                  className="block rounded-2xl border border-olive/10 bg-white/92 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-olive-dark">{order.supplierName}</div>
                      <div className="text-sm text-foreground/68">
                        {formatDateLabel(order.purchasedAt)}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-olive-dark">
                      {formatARS(order.totalCents / 100)}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyCard text="Todavía no hay órdenes de compra cargadas." />
            )}
          </div>
        </div>
      </section>

    </div>
  );
}

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="surface-panel organic-outline rounded-[1.8rem] p-5">
      <p className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-olive-dark">{value}</p>
      <p className="mt-2 text-sm text-foreground/64">{description}</p>
    </div>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-olive/16 bg-white/82 px-4 py-5 text-sm text-foreground/64">
      {text}
    </p>
  );
}

function AdminPageFallback() {
  return (
    <div>
      <span className="section-kicker">Backoffice</span>
      <h1 className="mt-3 font-display text-4xl font-semibold text-olive-dark">
        Resumen operativo
      </h1>
      <p className="mt-2 text-sm leading-6 text-foreground/66">Cargando panel...</p>
    </div>
  );
}
