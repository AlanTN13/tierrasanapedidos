import { formatAdminDateTime as formatDateTime } from "@/lib/admin-display";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { AdminBadge, AdminEmpty, AdminMetric } from "@/components/admin/admin-ui";
import { DashboardStockAlertCard } from "@/components/admin/dashboard-stock-alert-card";
import { costState, COST_LABELS } from "@/lib/admin-display";
import type { AdminDashboardMetrics, InventorySummaryRecord } from "@/lib/admin-operations";
import {formatARS, formatQuantity} from "@/lib/format";

type Props = { metrics: AdminDashboardMetrics; inventorySummary: InventorySummaryRecord[]; productCount: number; categoryCount: number };
export function DashboardOverview({ metrics, inventorySummary, productCount, categoryCount }: Props) {
  const alerts=inventorySummary.filter((item)=>item.isLowStock).slice(0,5);
  return <div className="space-y-4">
    <PageHeader title="Resumen comercial" description={`Últimos ${metrics.periodDays} días · desde ${formatDateTime(metrics.periodStart)} · Ventas y compras registradas.`} actions={<><Link className="admin-button" href="/admin/purchases/new">Nueva compra</Link><Link className="admin-button admin-button--primary" href="/admin/sales/new">+ Nueva venta</Link></>}/>
    <section className="admin-metrics" aria-label="Indicadores del período">
      <AdminMetric label="Facturación" value={formatARS(metrics.salesTotalCents/100)} detail={`Ventas de los últimos ${metrics.periodDays} días`}/>
      <AdminMetric label="Operaciones" value={String(metrics.salesCount)} detail="Ventas registradas en el período"/>
      <AdminMetric label="Ticket promedio" value={formatARS(metrics.salesCount?Math.round(metrics.salesTotalCents/metrics.salesCount)/100:0)} detail="Facturación / ventas del período"/>
      <AdminMetric label="Margen bruto estimado" value={metrics.salesWithMissingCostCount?"No concluyente":metrics.salesCount?formatARS(metrics.salesMarginCents/100):"—"} warning={metrics.salesWithMissingCostCount>0} detail={metrics.salesWithMissingCostCount?`${metrics.salesWithMissingCostCount} de ${metrics.salesCount} ventas con costo incompleto`:`${metrics.salesWithEstimatedCostCount} de ${metrics.salesCount} ventas con costo estimado · sin gastos fijos`}/>
      <AdminMetric label="Compras" value={formatARS(metrics.purchasesTotalCents/100)} detail="Órdenes del mismo período"/>
      <DashboardStockAlertCard inventorySummary={inventorySummary} value={String(metrics.stockLowCount)} description="Stock actual igual o menor a la presentación mínima"/>
    </section>
    {metrics.salesWithMissingCostCount || metrics.salesWithEstimatedCostCount ? <div className="admin-notice">Costos a revisar: {metrics.salesWithMissingCostCount} ventas con costo incompleto y {metrics.salesWithEstimatedCostCount} con costo estimado en el período. Los costos registrados tampoco certifican una revisión histórica. <Link className="underline font-semibold" href="/admin/sales">Consultar ventas</Link></div>:null}
    <section className="admin-split">
      <div className="admin-panel"><div className="admin-panel-header"><div><h2>Últimas ventas</h2><p className="admin-muted">Por fecha de venta · cualquier período</p></div><Link className="admin-button" href="/admin/sales">Ver ventas</Link></div>
        <table className="admin-table admin-table--responsive"><caption className="sr-only">Últimas ventas registradas</caption><thead><tr><th>Operación / cliente</th><th className="admin-number">Total</th><th>Costos</th></tr></thead><tbody>{metrics.recentSales.map((sale)=>{const quality=costState(sale.items);return <tr key={sale.id}><td data-label="Operación"><div><Link className="admin-primary" href={`/admin/sales/${sale.id}`}>{sale.saleCode}</Link><span className="admin-cell-note">{sale.channel||"Sin identificar"} · {formatDateTime(sale.soldAt)}</span></div></td><td className="admin-number" data-label="Total">{formatARS(sale.totalCents/100)}</td><td data-label="Costos"><AdminBadge tone={quality==="registered"?"neutral":"warning"}>{COST_LABELS[quality]}</AdminBadge></td></tr>;})}</tbody></table>
        {!metrics.recentSales.length?<AdminEmpty>Todavía no hay ventas registradas.</AdminEmpty>:null}
      </div>
      <div className="admin-panel"><div className="admin-panel-header"><div><h2>Productos con mayor rotación</h2><p className="admin-muted">Presentaciones vendidas · últimos {metrics.periodDays} días</p></div></div>
        <table className="admin-table"><caption className="sr-only">Rotación por presentación</caption><thead><tr><th style={{width:"72%"}}>Producto / presentación</th><th className="admin-number">Cantidad</th></tr></thead><tbody>{metrics.topRotationProducts.map((item)=><tr key={item.productPresentationId}><td>{item.name}</td><td className="admin-number admin-primary">{formatQuantity(item.quantitySold)}</td></tr>)}</tbody></table>{!metrics.topRotationProducts.length?<AdminEmpty>Sin ventas en el período.</AdminEmpty>:null}
      </div>
    </section>
    <section className="admin-split">
      <div className="admin-panel"><div className="admin-panel-header"><div><h2>Alertas de stock</h2><p className="admin-muted">Saldo actual en unidad base · hasta 5 productos</p></div><Link className="admin-button" href="/admin/products">Ver productos</Link></div>
        {alerts.length?<table className="admin-table"><caption className="sr-only">Alertas de stock actual</caption><thead><tr><th>Producto</th><th>Stock / referencia</th></tr></thead><tbody>{alerts.map((item)=><tr key={item.productId}><td><strong>{item.productName}</strong><span className="admin-cell-note">{item.baseSku}</span></td><td><AdminBadge tone={item.stockBaseUnits<0?"danger":"warning"}>{item.stockCurrentLabel}</AdminBadge><span className="admin-cell-note">Alerta ≤ {item.lowStockThresholdLabel}</span></td></tr>)}</tbody></table>:<AdminEmpty>Sin alertas registradas.</AdminEmpty>}
      </div>
      <div className="admin-panel"><div className="admin-panel-header"><div><h2>Últimas compras</h2><p className="admin-muted">Por fecha de compra · cualquier período</p></div><Link className="admin-button" href="/admin/purchases">Ver compras</Link></div>
        <table className="admin-table"><caption className="sr-only">Últimas compras registradas</caption><thead><tr><th>Proveedor / comprobante</th><th className="admin-number">Total</th></tr></thead><tbody>{metrics.recentPurchases.map((order)=><tr key={order.id}><td><Link className="admin-primary" href={`/admin/purchases/${order.id}`}>{order.supplierName}</Link><span className="admin-cell-note">{order.referenceNumber||"Sin comprobante"} · {formatDateTime(order.purchasedAt)}</span></td><td className="admin-number">{formatARS(order.totalCents/100)}</td></tr>)}</tbody></table>{!metrics.recentPurchases.length?<AdminEmpty>Todavía no hay compras registradas.</AdminEmpty>:null}
      </div>
    </section>
    <p className="admin-muted">Catálogo: {productCount} productos activos e inactivos · {categoryCount} categorías. Los importes son registros comerciales, no conciliación de cobros. Stock negativo y posibles inconsistencias requieren revisión; este panel no modifica saldos.</p>
  </div>;
}
