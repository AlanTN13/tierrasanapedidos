"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import { ListPagination } from "@/components/admin/list-pagination";
import type { InventorySummaryRecord } from "@/lib/admin-operations";
import type { AdminCatalogProduct } from "@/lib/catalog-data";
import { formatARS, formatQuantity } from "@/lib/format";

type ProductsListProps = {
  products: AdminCatalogProduct[];
  categoryNameById: Record<string, string>;
  inventorySummary: InventorySummaryRecord[];
  latestCostByProductId: Record<string, number>;
};

type ProductViewModel = {
  product: AdminCatalogProduct;
  inventory: InventorySummaryRecord | null;
  activePresentations: AdminCatalogProduct["presentations"];
  inactivePresentations: AdminCatalogProduct["presentations"];
  minPrice: number;
  maxPrice: number;
  lastBaseCostCents: number | null;
};

export function ProductsList({
  products,
  categoryNameById,
  inventorySummary,
  latestCostByProductId,
}: ProductsListProps) {
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [criticalFilter, setCriticalFilter] = useState<"all" | "critical" | "healthy">("all");
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);

  const inventoryByProductId = useMemo(
    () => new Map(inventorySummary.map((item) => [item.productId, item])),
    [inventorySummary],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalizeSearchText(deferredQuery);

    return products
      .map((product) => buildProductViewModel(product, inventoryByProductId, latestCostByProductId))
      .filter((item) => {
        if (statusFilter === "active" && !item.product.isActive) {
          return false;
        }

        if (statusFilter === "inactive" && item.product.isActive) {
          return false;
        }

        if (criticalFilter === "critical" && !item.inventory?.isLowStock) {
          return false;
        }

        if (criticalFilter === "healthy" && item.inventory?.isLowStock) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        const haystack = normalizeSearchText([
          item.product.name,
          item.product.slug,
          item.product.baseSku,
          item.product.description,
          item.product.tags.join(" "),
          item.product.categoryIds.map((categoryId) => categoryNameById[categoryId] ?? categoryId).join(" "),
          item.product.presentations.map((presentation) => presentation.etiqueta).join(" "),
          item.product.presentations.map((presentation) => presentation.sku ?? "").join(" "),
        ].join(" "));

        return haystack.includes(normalizedQuery);
      })
      .sort((a, b) => compareProductPriority(a, b));
  }, [categoryNameById, deferredQuery, inventoryByProductId, latestCostByProductId, products, statusFilter, criticalFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  function toggleProduct(productId: string) {
    const product = filteredProducts.find((item) => item.product.uuid === productId) ?? null;
    const isExpanded = expandedProductId === productId || (expandedProductId == null && shouldAutoExpand(product, criticalFilter) && productId === product?.product.uuid);
    setExpandedProductId(isExpanded ? null : productId);
  }

  return (
    <div className="space-y-4">
      <section className="surface-panel organic-outline rounded-[1.8rem] p-4 sm:p-5">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_180px_180px_auto] xl:items-end">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-olive-dark">Buscar producto</span>
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Nombre, SKU base, SKU de presentación o categoría"
              className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-olive-dark">Estado</span>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as typeof statusFilter);
                setPage(1);
              }}
              className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-olive-dark">Alerta</span>
            <select
              value={criticalFilter}
              onChange={(event) => {
                setCriticalFilter(event.target.value as typeof criticalFilter);
                setPage(1);
              }}
              className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
            >
              <option value="all">Todos</option>
              <option value="critical">Solo críticos</option>
              <option value="healthy">Sin alerta</option>
            </select>
          </label>

          <div className="rounded-2xl border border-olive/10 bg-olive-soft/24 px-4 py-3 text-sm text-olive-dark">
            {filteredProducts.length} de {products.length} productos
          </div>
        </div>
      </section>

      <section className="surface-panel organic-outline overflow-hidden rounded-[2rem]">
        <div className="grid gap-px bg-olive/8">
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((item) => (
              <article key={item.product.uuid} className="bg-white/92 px-4 py-3">
                <ProductCard
                  item={item}
                  categoryNameById={categoryNameById}
                  expanded={expandedProductId != null
                    ? expandedProductId === item.product.uuid
                    : shouldAutoExpand(item, criticalFilter)}
                  onToggle={() => toggleProduct(item.product.uuid)}
                />
              </article>
            ))
          ) : (
            <div className="bg-white/92 px-5 py-8 text-center text-sm text-foreground/66">
              No encontramos productos con esos filtros.
            </div>
          )}

          {filteredProducts.length > 0 ? (
            <ListPagination
              page={currentPage}
              pageSize={pageSize}
              totalItems={filteredProducts.length}
              onPageChange={setPage}
              onPageSizeChange={(nextPageSize) => {
                setPageSize(nextPageSize);
                setPage(1);
              }}
              itemLabel="productos"
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}

function ProductCard({
  item,
  categoryNameById,
  expanded,
  onToggle,
}: {
  item: ProductViewModel;
  categoryNameById: Record<string, string>;
  expanded: boolean;
  onToggle: () => void;
}) {
  const stockLabel = item.inventory?.stockBaseLabel ?? "0 unidades";
  const priceLabel =
    item.minPrice > 0
      ? item.minPrice === item.maxPrice
        ? formatARS(item.minPrice)
        : `${formatARS(item.minPrice)} a ${formatARS(item.maxPrice)}`
      : "Sin precio";
  const presentationsCount = item.activePresentations.length;
  const archivedCount = item.inactivePresentations.length;
  const purchasedLabel = item.inventory?.quantityPurchased ? formatQuantity(item.inventory.quantityPurchased) : "0";
  const soldLabel = item.inventory?.quantitySold ? formatQuantity(item.inventory.quantitySold) : "0";
  const stockTone = getStockTone(item);
  const hasMultiplePresentations = presentationsCount > 1;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-olive-dark">{item.product.name}</h2>
            <StockStatusBadge tone={stockTone} />
            {!item.product.isActive ? <StateBadge active={false} /> : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-controls={`product-detail-${item.product.uuid}`}
            className="inline-flex items-center justify-center rounded-full border border-olive/14 bg-white px-3.5 py-1.5 text-sm font-semibold text-olive-dark hover:bg-olive-soft/36"
          >
            {expanded ? "Ocultar detalle" : "Ver detalle"}
          </button>
          <Link
            href={`/admin/products/${item.product.slug}`}
            className="inline-flex items-center justify-center rounded-full bg-olive px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-olive-dark"
          >
            Editar
          </Link>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.7fr)_minmax(180px,220px)_minmax(180px,220px)] lg:items-stretch">
        <div className={`rounded-[1.5rem] border px-4 py-3 ${stockTone.cardClassName}`}>
          <p className="text-xs font-semibold tracking-[0.14em] uppercase opacity-75">
            Stock
          </p>
          <p className="mt-1 text-2xl font-semibold">{stockLabel}</p>
        </div>

        <SimpleMetric label="Precio" value={priceLabel} compact />
        <SimpleMetric
          label="Presentaciones"
          value={hasMultiplePresentations ? `${presentationsCount}` : "1"}
          description={hasMultiplePresentations ? "Mas de una" : "Una"}
          compact
        />
      </div>

      {expanded ? (
        <div
          id={`product-detail-${item.product.uuid}`}
          className="rounded-[1.5rem] border border-olive/10 bg-[#fbfaf4] p-4"
        >
          <div className="grid gap-5 xl:grid-cols-2">
            <section className="space-y-4 rounded-[1.6rem] border border-olive/10 bg-white p-4">
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
                      ? formatARS(item.lastBaseCostCents / 100)
                      : "Sin costo"
                  }
                />
              </div>
            </section>

            <section className="space-y-4 rounded-[1.6rem] border border-olive/10 bg-white p-4">
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

          <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-olive/10 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-olive/8">
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
                      <td className="px-4 py-3 font-semibold">{presentation.sku ?? "Sin SKU"}</td>
                      <td className="px-4 py-3">{presentation.etiqueta}</td>
                      <td className="px-4 py-3">{formatARS(presentation.precio)}</td>
                      <td className="px-4 py-3">
                        {formatEquivalentBase(presentation.amountInBaseUnits, presentation.measurementKind)}
                      </td>
                      <td className="px-4 py-3">
                        {presentation.amountInBaseUnits > 0
                          ? formatQuantity((item.inventory?.stockBaseUnits ?? 0) / presentation.amountInBaseUnits)
                          : "0"}
                      </td>
                      <td className="px-4 py-3">
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
      ) : null}
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

function SimpleMetric({
  label,
  value,
  description,
  compact = false,
}: {
  label: string;
  value: string;
  description?: string;
  compact?: boolean;
}) {
  return (
    <div className={`rounded-[1.5rem] border border-olive/10 bg-white ${compact ? "px-4 py-3" : "p-5"}`}>
      <p className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">{label}</p>
      <p className={`font-semibold text-olive-dark ${compact ? "mt-1 text-xl" : "mt-3 text-xl"}`}>{value}</p>
      {description ? <p className="mt-0.5 text-sm text-foreground/64">{description}</p> : null}
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-olive/10 bg-white/90 px-4 py-3">
      <p className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">{label}</p>
      <p className="mt-2 text-sm font-semibold text-olive-dark">{value}</p>
    </div>
  );
}

function StateBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        active
          ? "bg-olive-soft/48 text-olive-dark"
          : "bg-foreground/8 text-foreground/72"
      }`}
    >
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}

function StockStatusBadge({
  tone,
}: {
  tone: ReturnType<typeof getStockTone>;
}) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${tone.badgeClassName}`}>
      {tone.label}
    </span>
  );
}

function shouldAutoExpand(
  item: ProductViewModel | null,
  criticalFilter: "all" | "critical" | "healthy",
) {
  if (!item) {
    return false;
  }

  if (criticalFilter !== "critical") {
    return false;
  }

  return isOutOfStock(item) || Boolean(item.inventory?.isLowStock);
}

function isOutOfStock(item: ProductViewModel) {
  return (item.inventory?.stockBaseUnits ?? 0) <= 0;
}

function getStockTone(item: ProductViewModel) {
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
