"use client";

import { useDeferredValue, useState } from "react";
import { AdminBadge, AdminEmpty } from "@/components/admin/admin-ui";
import { ListPagination } from "@/components/admin/list-pagination";
import type { AdminPurchaseProductOption } from "@/lib/admin-operations";
import { normalizeAdminText } from "@/lib/admin-display";

export function InventoryList({products}:{products:AdminPurchaseProductOption[]}) {
  const [query,setQuery]=useState("");
  const [state,setState]=useState("all");
  const [page,setPage]=useState(1);
  const [pageSize,setPageSize]=useState(10);
  const normalized=normalizeAdminText(useDeferredValue(query));
  const filtered=products.filter((product)=>normalizeAdminText(`${product.productName} ${product.baseSku}`).includes(normalized) && (state==="all" || (state==="negative"?product.stockCurrentBaseUnits<0:product.stockCurrentBaseUnits===0)));
  const currentPage=Math.min(page,Math.max(1,Math.ceil(filtered.length/pageSize)));
  return <section className="space-y-3" aria-labelledby="inventory-title"><div><h2 id="inventory-title" className="text-lg font-semibold">Stock disponible</h2><p className="admin-muted">Saldo actual de productos con presentación de compra · cada producto conserva su unidad base.</p></div>
    <div className="admin-toolbar"><label className="admin-search">Buscar en inventario<input type="search" value={query} onChange={(e)=>{setQuery(e.target.value);setPage(1);}} placeholder="Producto o SKU base"/></label><label>Saldo<select value={state} onChange={(e)=>{setState(e.target.value);setPage(1);}}><option value="all">Todos</option><option value="negative">Negativo</option><option value="zero">Sin stock</option></select></label><button type="button" className="admin-button" onClick={()=>{setQuery("");setState("all");setPage(1);}}>Limpiar</button></div>
    <div className="admin-table-wrap">{filtered.length?<><table className="admin-table admin-table--responsive"><caption className="sr-only">Saldos de inventario</caption><thead><tr><th>Producto</th><th>SKU base</th><th>Stock base</th><th>Unidad de compra</th></tr></thead><tbody>{filtered.slice((currentPage-1)*pageSize,currentPage*pageSize).map((product)=><tr key={product.productId}><td data-label="Producto" className="admin-primary">{product.productName}</td><td data-label="SKU">{product.baseSku}</td><td data-label="Stock base"><AdminBadge tone={product.stockCurrentBaseUnits<0?"danger":product.stockCurrentBaseUnits===0?"warning":"neutral"}>{product.stockCurrentBaseLabel}</AdminBadge></td><td data-label="Compra en">{product.purchaseUnitLabel}</td></tr>)}</tbody></table><ListPagination page={currentPage} pageSize={pageSize} totalItems={filtered.length} onPageChange={setPage} onPageSizeChange={(size)=>{setPageSize(size);setPage(1);}} itemLabel="productos"/></>:<AdminEmpty>No encontramos saldos con estos filtros.</AdminEmpty>}</div>
  </section>;
}
