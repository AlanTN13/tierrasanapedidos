"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { ListPagination } from "@/components/admin/list-pagination";
import { SearchBar } from "@/components/search-bar";
import type { PurchaseOrderRecord } from "@/lib/admin-operations";
import { formatARS, formatDateTime } from "@/lib/format";

type PurchasesOverviewProps = {
  purchaseOrders: PurchaseOrderRecord[];
};

export function PurchasesOverview({ purchaseOrders }: PurchasesOverviewProps) {
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = normalizeText(deferredQuery);
  const filteredOrders = purchaseOrders.filter((order) => matchesOrder(order, normalizedQuery));
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const visibleSpendCents = paginatedOrders.reduce((sum, order) => sum + order.totalCents, 0);
  const visibleItems = paginatedOrders.reduce((sum, order) => sum + order.itemCount, 0);
  const supplierCount = new Set(
    paginatedOrders.map((order) => normalizeText(order.supplierName)).filter(Boolean),
  ).size;
  const averageOrderCents =
    paginatedOrders.length > 0 ? Math.round(visibleSpendCents / paginatedOrders.length) : 0;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          label="Compras visibles"
          value={String(paginatedOrders.length)}
          detail={
            filteredOrders.length === paginatedOrders.length
              ? "Órdenes visibles en el módulo"
              : `${filteredOrders.length} órdenes en el resultado filtrado`
          }
        />
        <SummaryCard
          label="Inversión"
          value={formatARS(visibleSpendCents / 100)}
          detail="Monto total de la página visible"
        />
        <SummaryCard
          label="Promedio"
          value={formatARS(averageOrderCents / 100)}
          detail="Promedio por orden visible"
        />
        <SummaryCard
          label="Proveedores"
          value={String(supplierCount)}
          detail="Proveedores distintos en esta página"
        />
        <SummaryCard
          label="Ítems cargados"
          value={String(visibleItems)}
          detail="Suma de ítems de esta página"
        />
      </section>

      <section className="surface-panel organic-outline rounded-[2rem] p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-olive-dark">Buscar compras</p>
            <p className="mt-1 text-sm leading-6 text-foreground/66">
              Filtrá por proveedor, comprobante, notas o productos incluidos en la orden.
            </p>
          </div>
          <SearchBar
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder="Buscar Molino, FAC-0012, arroz..."
            srLabel="Buscar compras"
          />
        </div>
      </section>

      <section className="surface-panel organic-outline overflow-hidden rounded-[2rem]">
        {filteredOrders.length > 0 ? (
          <div className="grid gap-px bg-olive/8">
            {paginatedOrders.map((order) => (
              <article
                key={order.id}
                className="grid gap-4 bg-white/92 px-5 py-4 md:grid-cols-[minmax(0,1fr)_220px_150px]"
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
                  <p className="mt-3 text-sm text-foreground/62">
                    {order.items
                      .slice(0, 3)
                      .map((item) => `${item.productName} · ${item.quantityLabel}`)
                      .join(" · ") || "Sin ítems"}
                    {order.items.length > 3 ? ` +${order.items.length - 3} más` : ""}
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
            <ListPagination
              page={currentPage}
              pageSize={pageSize}
              totalItems={filteredOrders.length}
              onPageChange={setPage}
              onPageSizeChange={(nextPageSize) => {
                setPageSize(nextPageSize);
                setPage(1);
              }}
              itemLabel="compras"
            />
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="text-lg font-semibold text-olive-dark">No encontramos compras con esa búsqueda.</p>
            <p className="mt-2 text-sm leading-6 text-foreground/66">
              Probá con otro proveedor, comprobante o producto.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="surface-panel organic-outline rounded-[1.8rem] p-5">
      <p className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-olive-dark">{value}</p>
      <p className="mt-2 text-sm leading-6 text-foreground/64">{detail}</p>
    </article>
  );
}

function matchesOrder(order: PurchaseOrderRecord, query: string) {
  if (!query) {
    return true;
  }

  const searchableValues = [
    order.supplierName,
    order.referenceNumber,
    order.notes,
    ...order.items.flatMap((item) => [item.productName, item.presentationLabel]),
  ];

  return searchableValues.some((value) => normalizeText(value).includes(query));
}

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}
