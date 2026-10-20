"use client";

import { formatAdminDateTime as formatDateTime } from "@/lib/admin-display";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { ListPagination } from "@/components/admin/list-pagination";
import { AdminEmpty, AdminMetric } from "@/components/admin/admin-ui";
import { matchesAdminDate, normalizeAdminText } from "@/lib/admin-display";
import type { PurchaseOrderRecord } from "@/lib/admin-operations";
import {formatARS} from "@/lib/format";

export function PurchasesOverview({ purchaseOrders }: { purchaseOrders: PurchaseOrderRecord[] }) {
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const normalizedQuery = normalizeAdminText(useDeferredValue(query));
  const filteredOrders = purchaseOrders.filter((order) => matchesAdminDate(order.purchasedAt, from, to) && [order.supplierName, order.referenceNumber, order.notes, ...order.items.flatMap((item) => [item.productName, item.presentationLabel, item.baseSku])].some((value) => normalizeAdminText(value).includes(normalizedQuery)));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filteredOrders.length / pageSize)));
  const total = filteredOrders.reduce((sum, order) => sum + order.totalCents, 0);
  const supplierCount = new Set(filteredOrders.map((order) => normalizeAdminText(order.supplierName)).filter(Boolean)).size;
  const items = filteredOrders.reduce((sum, order) => sum + order.itemCount, 0);
  function reset() { setQuery(""); setFrom(""); setTo(""); setPage(1); }
  return <div className="space-y-4">
    <p className="admin-muted">Indicadores del resultado filtrado completo · no cambian al paginar.</p>
    <section className="admin-metrics">
      <AdminMetric label="Compras registradas" value={String(filteredOrders.length)} detail={`${purchaseOrders.length} registros disponibles`} />
      <AdminMetric label="Compras" value={formatARS(total / 100)} detail="Importe del resultado filtrado" />
      <AdminMetric label="Promedio por compra" value={formatARS(filteredOrders.length ? Math.round(total / filteredOrders.length) / 100 : 0)} detail="Importe / órdenes del resultado" />
      <AdminMetric label="Proveedores" value={String(supplierCount)} detail="Nombres distintos en el resultado" />
      <AdminMetric label="Ítems cargados" value={String(items)} detail="Ítems del resultado filtrado" />
    </section>
    <section className="admin-toolbar" aria-label="Filtrar compras">
      <label className="admin-search">Buscar compra<input type="search" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Proveedor, comprobante, producto o notas" /></label>
      <label>Desde<input type="date" value={from} max={to || undefined} onChange={(e) => { setFrom(e.target.value); setPage(1); }} /></label>
      <label>Hasta<input type="date" value={to} min={from || undefined} onChange={(e) => { setTo(e.target.value); setPage(1); }} /></label>
      <button type="button" className="admin-button" onClick={reset}>Limpiar</button>
    </section>
    <div className="admin-table-wrap">{filteredOrders.length ? <>
      <table className="admin-table admin-table--responsive"><caption className="sr-only">Órdenes de compra</caption><thead><tr><th style={{width:"22%"}}>Proveedor</th><th style={{width:"18%"}}>Fecha / comprobante</th><th style={{width:"26%"}}>Productos / notas</th><th style={{width:"7%"}}>Ítems</th><th style={{width:"14%"}} className="admin-number">Total</th><th style={{width:"13%"}}>Acciones</th></tr></thead>
        <tbody>{filteredOrders.slice((currentPage-1)*pageSize,currentPage*pageSize).map((order) => <tr key={order.id}>
          <td data-label="Proveedor" className="admin-primary">{order.supplierName}</td>
          <td data-label="Fecha"><div>{formatDateTime(order.purchasedAt)}<span className="admin-cell-note">{order.referenceNumber || "Sin comprobante"}</span></div></td>
          <td data-label="Productos"><div>{order.items.slice(0,2).map((item) => `${item.productName} · ${item.quantityLabel}`).join(" / ") || "Sin ítems"}{order.items.length > 2 ? ` +${order.items.length-2} más` : ""}{order.notes ? <span className="admin-cell-note">{order.notes}</span> : null}</div></td>
          <td data-label="Ítems">{order.itemCount}</td><td data-label="Total" className="admin-number admin-primary">{formatARS(order.totalCents/100)}</td>
          <td data-label="Acciones"><Link className="admin-button" href={`/admin/purchases/${order.id}`}>Ver detalle</Link></td>
        </tr>)}</tbody></table>
      <ListPagination page={currentPage} pageSize={pageSize} totalItems={filteredOrders.length} onPageChange={setPage} onPageSizeChange={(size)=>{setPageSize(size);setPage(1);}} itemLabel="compras" />
    </> : <AdminEmpty>No encontramos compras con estos filtros. <button type="button" className="underline" onClick={reset}>Limpiar filtros</button></AdminEmpty>}</div>
  </div>;
}
