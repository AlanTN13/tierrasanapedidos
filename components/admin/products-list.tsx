"use client";

import { Fragment, useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import { ListPagination } from "@/components/admin/list-pagination";
import { AdminBadge, AdminEmpty } from "@/components/admin/admin-ui";
import type { InventorySummaryRecord } from "@/lib/admin-operations";
import type { AdminCatalogProduct } from "@/lib/catalog-data";
import { formatARS, formatQuantity } from "@/lib/format";

type ProductsListProps = {
  products: AdminCatalogProduct[];
  categoryNameById: Record<string,string>;
  inventorySummary: InventorySummaryRecord[];
  latestCostByProductId: Record<string,number>;
};
type ProductViewModel = {
  product: AdminCatalogProduct;
  inventory: InventorySummaryRecord | null;
  activePresentations: AdminCatalogProduct["presentations"];
  inactivePresentations: AdminCatalogProduct["presentations"];
  minPrice: number; maxPrice: number; lastBaseCostCents: number | null;
};
export function ProductsList({products,categoryNameById,inventorySummary,latestCostByProductId}: ProductsListProps) {
  const [query,setQuery]=useState("");
  const [statusFilter,setStatusFilter]=useState("all");
  const [criticalFilter,setCriticalFilter]=useState<"all"|"critical"|"healthy">("all");
  const [categoryFilter,setCategoryFilter]=useState("all");
  const [costFilter,setCostFilter]=useState("all");
  const [page,setPage]=useState(1);
  const [pageSize,setPageSize]=useState(10);
  const [expandedProductId,setExpandedProductId]=useState<string|null>(null);
  const deferredQuery=useDeferredValue(query);
  const inventoryByProductId=useMemo(()=>new Map(inventorySummary.map((item)=>[item.productId,item])),[inventorySummary]);
  const filteredProducts=useMemo(()=> {
    const query=normalizeSearchText(deferredQuery);
    return products.map((product)=>buildProductViewModel(product,inventoryByProductId,latestCostByProductId)).filter((item)=> {
      if(statusFilter!=="all" && item.product.isActive !== (statusFilter==="active"))return false;
      if(criticalFilter==="critical" && !item.inventory?.isLowStock)return false;
      if(criticalFilter==="healthy" && (!item.inventory || item.inventory.isLowStock))return false;
      if(categoryFilter!=="all" && !item.product.categoryIds.includes(categoryFilter))return false;
      if(costFilter==="missing" && item.lastBaseCostCents!=null && item.lastBaseCostCents>0)return false;
      return normalizeSearchText([item.product.name,item.product.slug,item.product.baseSku,item.product.description,item.product.tags.join(" "),item.product.categoryIds.map((id)=>categoryNameById[id]??id).join(" "),...item.product.presentations.flatMap((p)=>[p.etiqueta,p.sku??""])].join(" ")).includes(query);
    }).sort(compareProductPriority);
  },[deferredQuery,products,inventoryByProductId,latestCostByProductId,statusFilter,criticalFilter,categoryFilter,costFilter,categoryNameById]);
  const currentPage=Math.min(page,Math.max(1,Math.ceil(filteredProducts.length/pageSize)));
  function reset(){setQuery("");setStatusFilter("all");setCriticalFilter("all");setCategoryFilter("all");setCostFilter("all");setPage(1);setExpandedProductId(null);}
  return <div className="space-y-4">
    <section className="admin-toolbar" aria-label="Filtrar productos">
      <label className="admin-search">Buscar producto<input type="search" value={query} onChange={(e)=>{setQuery(e.target.value);setPage(1);}} placeholder="Nombre, SKU, presentación o categoría" /></label>
      <label>Categoría<select value={categoryFilter} onChange={(e)=>{setCategoryFilter(e.target.value);setPage(1);}}><option value="all">Todas</option>{Object.entries(categoryNameById).map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
      <label>Estado<select value={statusFilter} onChange={(e)=>{setStatusFilter(e.target.value);setPage(1);}}><option value="all">Todos</option><option value="active">Activos</option><option value="inactive">Inactivos</option></select></label>
      <label>Stock<select value={criticalFilter} onChange={(e)=>{setCriticalFilter(e.target.value as typeof criticalFilter);setPage(1);}}><option value="all">Todos</option><option value="critical">Con alerta</option><option value="healthy">Sin alerta</option></select></label>
      <label>Costo<select value={costFilter} onChange={(e)=>{setCostFilter(e.target.value);setPage(1);}}><option value="all">Todos</option><option value="missing">Sin costo registrado</option></select></label>
      <button type="button" className="admin-button" onClick={reset}>Limpiar</button>
    </section>
    <p className="admin-muted" role="status">{filteredProducts.length} de {products.length} productos · stock en unidad base · costo de última compra por kg, litro o unidad.</p>
    <div className="admin-table-wrap">{filteredProducts.length ? <>
      <table className="admin-table admin-table--responsive"><caption className="sr-only">Productos, presentaciones, precio, costo y stock</caption><thead><tr><th style={{width:"25%"}}>Producto / categoría</th><th style={{width:"9%"}}>Pres.</th><th style={{width:"15%"}}>Precio</th><th style={{width:"15%"}}>Último costo</th><th style={{width:"13%"}}>Stock base</th><th style={{width:"9%"}}>Estado</th><th style={{width:"14%"}}>Acciones</th></tr></thead>
      <tbody>{filteredProducts.slice((currentPage-1)*pageSize,currentPage*pageSize).map((item)=>{
        const expanded=expandedProductId===item.product.uuid;
        const tone=getStockTone(item);
        const price=item.minPrice>0?(item.minPrice===item.maxPrice?formatARS(item.minPrice):`${formatARS(item.minPrice)} – ${formatARS(item.maxPrice)}`):"Sin precio";
        return <Fragment key={item.product.uuid}><tr>
          <td data-label="Producto"><div><strong>{item.product.name}</strong><span className="admin-cell-note">{item.product.baseSku}</span><span className="admin-cell-note">{item.product.categoryIds.map((id)=>categoryNameById[id]??id).join(" · ") || "Sin categoría"}</span></div></td>
          <td data-label="Presentaciones">{item.activePresentations.length}</td>
          <td data-label="Precio">{price}</td>
          <td data-label="Costo"><div>{item.lastBaseCostCents!=null && item.lastBaseCostCents>0?`${formatARS(item.lastBaseCostCents/100)} / ${costUnit(item)}`:<AdminBadge tone="warning">Sin costo registrado</AdminBadge>}</div></td>
          <td data-label="Stock base"><div><strong>{item.inventory?.stockBaseLabel??"Sin registro"}</strong><span className="admin-cell-note"><AdminBadge tone={!item.inventory?"neutral":item.inventory.stockBaseUnits<=0?"danger":item.inventory.isLowStock?"warning":"success"}>{tone.label}</AdminBadge></span></div></td>
          <td data-label="Estado"><AdminBadge tone={item.product.isActive?"success":"neutral"}>{item.product.isActive?"Activo":"Inactivo"}</AdminBadge></td>
          <td data-label="Acciones"><div className="admin-actions"><button type="button" className="admin-button" aria-expanded={expanded} aria-controls={`product-detail-${item.product.uuid}`} onClick={()=>setExpandedProductId(expanded?null:item.product.uuid)}>{expanded?"Cerrar":"Detalle"}</button><Link className="admin-button" href={`/admin/products/${item.product.slug}`}>Editar</Link></div></td>
        </tr>{expanded?<tr className="admin-detail-row"><td colSpan={7} className="admin-cell-wide"><ProductDetail item={item} categoryNameById={categoryNameById}/></td></tr>:null}</Fragment>;
      })}</tbody></table>
      <ListPagination page={currentPage} pageSize={pageSize} totalItems={filteredProducts.length} onPageChange={setPage} onPageSizeChange={(size)=>{setPageSize(size);setPage(1);}} itemLabel="productos"/>
    </>:<AdminEmpty>No encontramos productos con esos filtros. <button type="button" className="underline" onClick={reset}>Limpiar filtros</button></AdminEmpty>}</div>
  </div>;
}
function costUnit(item: ProductViewModel) {
  const kind=item.inventory?.measurementKind??item.activePresentations[0]?.measurementKind??item.product.presentations[0]?.measurementKind;
  return kind==="weight"?"kg":kind==="volume"?"l":"unidad";
}
function ProductDetail({item,categoryNameById}:{item:ProductViewModel;categoryNameById:Record<string,string>}){
  const stockLabel=item.inventory?.stockBaseLabel??"Sin registro";
  const purchasedLabel=item.inventory?formatEquivalentBase(item.inventory.quantityPurchased,item.inventory.measurementKind):"Sin registro";
  const soldLabel=item.inventory?formatEquivalentBase(item.inventory.quantitySold,item.inventory.measurementKind):"Sin registro";
  const stockTone=getStockTone(item);
  const archivedCount=item.inactivePresentations.length;
  return (
        <div
          id={`product-detail-${item.product.uuid}`}
          className="rounded-lg border border-olive/10 bg-[#fbfaf4] p-4"
        >
          <div className="grid gap-5 xl:grid-cols-2">
            <section className="space-y-4 rounded-lg border border-olive/10 bg-white p-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">
                  Inventario
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <MetricPill label="Stock actual" value={stockLabel} />
                <MetricPill
                  label="Referencia alerta"
                  value={
                    item.inventory
                      ? `${item.inventory.lowStockThresholdLabel} (${item.inventory.smallestPresentationLabel})`
                      : "Sin referencia"
                  }
                />
                <MetricPill label="Estado" value={stockTone.label} />
                <MetricPill label="Comprado" value={purchasedLabel} />
                <MetricPill label="Vendido" value={soldLabel} />
                <MetricPill
                  label="Costo base"
                  value={
                    item.lastBaseCostCents != null
                      ? `${formatARS(item.lastBaseCostCents / 100)} / ${costUnit(item)}`
                      : "Sin costo"
                  }
                />
              </div>
            </section>

            <section className="space-y-4 rounded-lg border border-olive/10 bg-white p-4">
              <p className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">
                Catalogo
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <MetricPill label="SKU base" value={item.product.baseSku} />
                <MetricPill label="Slug" value={`/${item.product.slug}`} />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">
                  Categorias
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.product.categoryIds.map((categoryId) => (
                    <span
                      key={categoryId}
                      className="rounded-full bg-olive-soft/48 px-2.5 py-1 text-[11px] font-semibold text-olive-dark"
                    >
                      {categoryNameById[categoryId] ?? categoryId}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">
                  Descripcion
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground/70">
                  {item.product.description || "Sin descripción cargada."}
                </p>
              </div>
              {archivedCount > 0 ? (
                <div>
                  <p className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">
                    Presentaciones archivadas
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.inactivePresentations.map((presentation) => (
                      <span
                        key={`${item.product.uuid}-inactive-${presentation.id ?? presentation.sku ?? presentation.etiqueta}`}
                        className="rounded-full border border-olive/10 bg-white px-3 py-1 text-xs text-foreground/68"
                      >
                        {presentation.sku ?? "Sin SKU"} · {presentation.etiqueta}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-olive/10 bg-white">
            <div className="overflow-x-auto">
              <table className="admin-table admin-table--responsive">
                <thead className="bg-olive-soft/32">
                  <tr className="text-left text-[11px] font-semibold tracking-[0.14em] text-earth uppercase">
                    <th className="px-4 py-3">SKU presentacion</th>
                    <th className="px-4 py-3">Etiqueta</th>
                    <th className="px-4 py-3">Precio</th>
                    <th className="px-4 py-3">Equivalencia base</th>
                    <th className="px-4 py-3">Stock posible</th>
                    <th className="px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-olive/8 text-sm text-olive-dark">
                  {item.activePresentations.map((presentation) => (
                    <tr
                      key={`${item.product.uuid}-${presentation.id ?? presentation.sku ?? presentation.etiqueta}`}
                    >
                      <td data-label="SKU" className="px-4 py-3 font-semibold">{presentation.sku ?? "Sin SKU"}</td>
                      <td data-label="Presentación" className="px-4 py-3">{presentation.etiqueta}</td>
                      <td data-label="Precio" className="px-4 py-3">{formatARS(presentation.precio)}</td>
                      <td data-label="Equivalencia" className="px-4 py-3">
                        {formatEquivalentBase(presentation.amountInBaseUnits, presentation.measurementKind)}
                      </td>
                      <td data-label="Stock posible" className="px-4 py-3">
                        {presentation.amountInBaseUnits > 0
                          ? formatQuantity((item.inventory?.stockBaseUnits ?? 0) / presentation.amountInBaseUnits)
                          : "0"}
                      </td>
                      <td data-label="Estado" className="px-4 py-3">
                        {item.inventory?.smallestPresentationSku === presentation.sku
                          ? "Minima alerta"
                          : "Activa"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
  );
}

function buildProductViewModel(
  product: AdminCatalogProduct,
  inventoryByProductId: Map<string, InventorySummaryRecord>,
  latestCostByProductId: Record<string, number>,
): ProductViewModel {
  const activePresentations = product.presentations.filter((presentation) => presentation.activa ?? true);
  const inactivePresentations = product.presentations.filter((presentation) => !(presentation.activa ?? true));
  const prices = activePresentations.map((presentation) => presentation.precio).filter((price) => Number.isFinite(price) && price > 0);

  return {
    product,
    inventory: inventoryByProductId.get(product.uuid) ?? null,
    activePresentations,
    inactivePresentations,
    minPrice: prices.length > 0 ? Math.min(...prices) : 0,
    maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
    lastBaseCostCents: latestCostByProductId[product.uuid] ?? null,
  };
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-olive/10 bg-white/90 px-4 py-3">
      <p className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">{label}</p>
      <p className="mt-2 text-sm font-semibold text-olive-dark">{value}</p>
    </div>
  );
}

function isOutOfStock(item: ProductViewModel) {
  return item.inventory != null && item.inventory.stockBaseUnits <= 0;
}

function getStockTone(item: ProductViewModel) {
  if (!item.inventory) return { label: "Sin registro", description: "Stock no disponible.", badgeClassName: "bg-gray-100 text-gray-600", cardClassName: "border-gray-200", priority: 3 };
  if (item.inventory.stockBaseUnits < 0) return { label: "Stock negativo", description: "Revisar movimientos.", badgeClassName: "bg-red-100 text-red-700", cardClassName: "border-red-200", priority: 0 };
  if (isOutOfStock(item)) {
    return {
      label: "Sin stock",
      description: "Requiere reposicion inmediata.",
      badgeClassName: "bg-[#9f0f0f]/12 text-[#9f0f0f]",
      cardClassName: "border-[#9f0f0f]/18 bg-[#fff4f1] text-[#7b1712]",
      priority: 0,
    };
  }

  if (item.inventory?.isLowStock) {
    return {
      label: "Stock critico",
      description: "Conviene reponer pronto.",
      badgeClassName: "bg-[#c47a00]/14 text-[#9a6200]",
      cardClassName: "border-[#d8b05c]/24 bg-[#fff9ec] text-[#7d5b13]",
      priority: 1,
    };
  }

  return {
    label: "Stock saludable",
    description: "No requiere accion inmediata.",
    badgeClassName: "bg-olive-soft/60 text-olive-dark",
    cardClassName: "border-olive/12 bg-[#f7fbf4] text-olive-dark",
    priority: 2,
  };
}

function compareProductPriority(a: ProductViewModel, b: ProductViewModel) {
  const aOutOfStock = isOutOfStock(a);
  const bOutOfStock = isOutOfStock(b);

  if (aOutOfStock !== bOutOfStock) {
    return aOutOfStock ? 1 : -1;
  }

  const stockPriorityDifference = getStockTone(a).priority - getStockTone(b).priority;

  if (stockPriorityDifference !== 0) {
    return stockPriorityDifference;
  }

  if (a.product.isActive !== b.product.isActive) {
    return a.product.isActive ? 1 : -1;
  }

  if (a.activePresentations.length !== b.activePresentations.length) {
    return b.activePresentations.length - a.activePresentations.length;
  }

  return a.product.name.localeCompare(b.product.name, "es");
}

function formatEquivalentBase(amountInBaseUnits: number, measurementKind: AdminCatalogProduct["presentations"][number]["measurementKind"]) {
  if (measurementKind === "unit") {
    return `${formatQuantity(amountInBaseUnits)} un`;
  }

  const useLargeUnit = amountInBaseUnits >= 1000;
  const normalizedAmount = useLargeUnit ? amountInBaseUnits / 1000 : amountInBaseUnits;
  const unit =
    measurementKind === "weight"
      ? useLargeUnit
        ? "kg"
        : "g"
      : useLargeUnit
        ? "l"
        : "ml";

  return `${formatQuantity(normalizedAmount)} ${unit}`;
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}
