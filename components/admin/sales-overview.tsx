"use client";

import { formatAdminDateTime as formatDateTime } from "@/lib/admin-display";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { AlertProductsModal, type AlertProductItem } from "@/components/admin/alert-products-modal";
import { ListPagination } from "@/components/admin/list-pagination";
import { AdminBadge, AdminEmpty, AdminMetric } from "@/components/admin/admin-ui";
import { COST_LABELS, costState, matchesAdminDate, normalizeAdminText } from "@/lib/admin-display";
import type { SaleRecord } from "@/lib/admin-operations";
import {formatARS} from "@/lib/format";

export function SalesOverview({ sales }: { sales: SaleRecord[] }) {
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [quality, setQuality] = useState("all");
  const [client, setClient] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const normalizedQuery = normalizeAdminText(useDeferredValue(query));
  const filteredSales = sales.filter((sale) => {
    const state = costState(sale.items);
    return matchesAdminDate(sale.soldAt, from, to)
      && (quality === "all" || (quality === "review" ? state !== "registered" : state === quality))
      && (client === "all" || !sale.channel.trim())
      && [sale.saleCode, sale.channel, sale.notes, ...sale.items.flatMap((item) => [item.productName, item.presentationLabel, item.baseSku, item.presentationSku])].some((value) => normalizeAdminText(value).includes(normalizedQuery));
  });
  const totalPages = Math.max(1, Math.ceil(filteredSales.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedSales = filteredSales.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const revenue = filteredSales.reduce((sum, sale) => sum + sale.totalCents, 0);
  const margin = filteredSales.reduce((sum, sale) => sum + sale.totalMarginCents, 0);
  const missingCount = filteredSales.filter((sale) => costState(sale.items) === "missing").length;
  const estimatedCount = filteredSales.filter((sale) => costState(sale.items) === "estimated").length;
  const negativeStockCount = filteredSales.filter((sale) => sale.hasNegativeStock).length;
  const alertProducts: AlertProductItem[] = Array.from(new Map(filteredSales.flatMap((sale) => sale.items.filter((item) => item.hasNegativeStock).map((item) => [
    `${item.productId}:${item.productPresentationId}`, { id: `${item.productId}:${item.productPresentationId}`, name: `${item.productName} · ${item.presentationLabel}`, detail: `Stock base actual: ${item.stockCurrentBaseLabel}`, note: `Detectado en ${sale.saleCode}` } satisfies AlertProductItem,
  ]))).values());
  function reset() { setQuery(""); setFrom(""); setTo(""); setQuality("all"); setClient("all"); setPage(1); }

  return <div className="space-y-4">
    <p className="admin-muted">Indicadores del resultado filtrado completo · {from || "Inicio de los registros"} a {to || "último registro"}. La paginación no cambia estos totales.</p>
    <section className="admin-metrics" aria-label="Resumen de ventas filtradas">
      <AdminMetric label="Ventas registradas" value={String(filteredSales.length)} detail={`${sales.length} registros disponibles`} />
      <AdminMetric label="Facturación" value={formatARS(revenue / 100)} detail="Total de ventas del resultado" />
      <AdminMetric label="Ticket promedio" value={formatARS(filteredSales.length ? Math.round(revenue / filteredSales.length) / 100 : 0)} detail="Facturación / operaciones del resultado" />
      <AdminMetric label="Margen bruto estimado" value={missingCount ? "No concluyente" : filteredSales.length ? formatARS(margin / 100) : "—"} warning={missingCount > 0} detail={missingCount ? `${missingCount} ventas con costo incompleto` : `${estimatedCount} ventas con costo estimado · sin gastos fijos`} />
      <AlertProductsModal label="Alertas de stock" value={String(negativeStockCount)} description="Ventas del resultado con stock base negativo" title="Productos con stock negativo" emptyText="Sin alertas de stock en este resultado." items={alertProducts} tone={negativeStockCount ? "warn" : "default"} />
    </section>
    <section className="admin-toolbar" aria-label="Filtrar ventas">
      <label className="admin-search">Buscar venta<input type="search" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Código, cliente, SKU, producto o notas" /></label>
      <label>Desde<input type="date" value={from} max={to || undefined} onChange={(e) => { setFrom(e.target.value); setPage(1); }} /></label>
      <label>Hasta<input type="date" value={to} min={from || undefined} onChange={(e) => { setTo(e.target.value); setPage(1); }} /></label>
      <label>Costos<select value={quality} onChange={(e) => { setQuality(e.target.value); setPage(1); }}><option value="all">Todos</option><option value="review">A revisar</option><option value="registered">Registrados</option><option value="estimated">Estimados</option><option value="missing">Incompletos</option></select></label>
      <label>Cliente<select value={client} onChange={(e) => { setClient(e.target.value); setPage(1); }}><option value="all">Todos</option><option value="missing">Sin identificar</option></select></label>
      <button type="button" className="admin-button" onClick={reset}>Limpiar</button>
    </section>
    <div className="admin-table-wrap">
      {filteredSales.length ? <>
        <table className="admin-table admin-table--responsive"><caption className="sr-only">Ventas registradas, costos y stock actual</caption>
          <thead><tr><th style={{width:"18%"}}>Operación / fecha</th><th style={{width:"22%"}}>Cliente / productos</th><th style={{width:"8%"}}>Ítems</th><th className="admin-number" style={{width:"15%"}}>Total</th><th style={{width:"23%"}}>Margen y calidad del costo</th><th style={{width:"14%"}}>Acciones</th></tr></thead>
          <tbody>{paginatedSales.map((sale) => {
            const state = costState(sale.items);
            return <tr key={sale.id}>
              <td data-label="Operación"><Link className="admin-primary" href={`/admin/sales/${sale.id}`}>{sale.saleCode}</Link><span className="admin-cell-note">{formatDateTime(sale.soldAt)}</span></td>
              <td data-label="Cliente"><div><strong>{sale.channel || "Sin identificar"}</strong><span className="admin-cell-note">{sale.items.slice(0,2).map((item) => `${item.productName} · ${item.presentationLabel}`).join(" / ") || "Sin ítems"}{sale.items.length > 2 ? ` +${sale.items.length - 2} más` : ""}</span>{sale.notes ? <span className="admin-cell-note">{sale.notes}</span> : null}</div></td>
              <td data-label="Ítems">{sale.itemCount}</td>
              <td data-label="Total" className="admin-number admin-primary">{formatARS(sale.totalCents / 100)}</td>
              <td data-label="Margen"><div>{state === "missing" ? "—" : formatARS(sale.totalMarginCents / 100)}<span className="admin-cell-note"><AdminBadge tone={state === "registered" ? "neutral" : "warning"}>{COST_LABELS[state]}</AdminBadge></span>{sale.hasNegativeStock ? <span className="admin-cell-note"><AdminBadge tone="danger">Stock negativo</AdminBadge></span> : null}</div></td>
              <td data-label="Acciones"><Link className="admin-button" href={`/admin/sales/${sale.id}`}>Ver detalle</Link></td>
            </tr>;
          })}</tbody>
        </table>
        <ListPagination page={currentPage} pageSize={pageSize} totalItems={filteredSales.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} itemLabel="ventas" />
      </> : <AdminEmpty>No encontramos ventas con estos filtros. <button className="underline" onClick={reset} type="button">Limpiar filtros</button></AdminEmpty>}
    </div>
    <p className="admin-muted">Costo registrado indica un costo guardado, sin certificar su revisión histórica. Estimado usa el último costo disponible. Un costo incompleto no se interpreta como costo cero. Stock corresponde al saldo actual.</p>
  </div>;
}
