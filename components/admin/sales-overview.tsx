"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import {
  AlertProductsModal,
  type AlertProductItem,
} from "@/components/admin/alert-products-modal";
import { ListPagination } from "@/components/admin/list-pagination";
import { SearchBar } from "@/components/search-bar";
import type { SaleRecord } from "@/lib/admin-operations";
import { formatARS, formatDateTime } from "@/lib/format";

type SalesOverviewProps = {
  sales: SaleRecord[];
};

export function SalesOverview({ sales }: SalesOverviewProps) {
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = normalizeText(deferredQuery);
  const filteredSales = sales.filter((sale) => matchesSale(sale, normalizedQuery));
  const totalPages = Math.max(1, Math.ceil(filteredSales.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const visibleRevenueCents = paginatedSales.reduce((sum, sale) => sum + sale.totalCents, 0);
  const visibleMarginCents = paginatedSales.reduce((sum, sale) => sum + sale.totalMarginCents, 0);
  const visibleItems = paginatedSales.reduce((sum, sale) => sum + sale.itemCount, 0);
  const negativeStockCount = paginatedSales.filter((sale) => sale.hasNegativeStock).length;
  const alertProducts: AlertProductItem[] = Array.from(
    new Map(
      paginatedSales
        .flatMap((sale) =>
          sale.items
            .filter((item) => item.hasNegativeStock)
            .map((item) => [
              `${item.productId}:${item.productPresentationId}`,
              {
                id: `${item.productId}:${item.productPresentationId}`,
                name: `${item.productName} · ${item.presentationLabel}`,
                detail: `Stock base actual: ${item.stockCurrentBaseLabel}`,
                note: `Detectado en ${sale.saleCode}`,
              } satisfies AlertProductItem,
            ]),
        ),
    ).values(),
  );
  const averageTicketCents =
    paginatedSales.length > 0 ? Math.round(visibleRevenueCents / paginatedSales.length) : 0;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          label="Ventas visibles"
          value={String(paginatedSales.length)}
          detail={
            filteredSales.length === paginatedSales.length
              ? "Conteo actualizado del módulo"
              : `${filteredSales.length} ventas en el resultado filtrado`
          }
        />
        <SummaryCard
          label="Facturación"
          value={formatARS(visibleRevenueCents / 100)}
          detail="Suma de la página visible"
        />
        <SummaryCard
          label="Margen"
          value={formatARS(visibleMarginCents / 100)}
          detail="Margen bruto de esta página"
        />
        <SummaryCard
          label="Ticket promedio"
          value={formatARS(averageTicketCents / 100)}
          detail="Promedio por venta visible"
        />
        <AlertProductsModal
          label="Alertas de stock"
          value={String(negativeStockCount)}
          description={`${visibleItems} ítems en la página visible`}
          title="Productos con alerta de stock en ventas"
          emptyText="No hay productos con alerta de stock en las ventas de esta página."
          items={alertProducts}
          tone={negativeStockCount > 0 ? "warn" : "default"}
        />
      </section>

      <section className="surface-panel organic-outline rounded-[2rem] p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-olive-dark">Buscar ventas</p>
            <p className="mt-1 text-sm leading-6 text-foreground/66">
              Filtrá por código, cliente, notas o cualquier producto incluido en la venta.
            </p>
          </div>
          <SearchBar
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder="Buscar TS-000058, Sabrina, hummus..."
            srLabel="Buscar ventas"
          />
        </div>
      </section>

      <section className="surface-panel organic-outline overflow-hidden rounded-[2rem]">
        {filteredSales.length > 0 ? (
          <div className="grid gap-px bg-olive/8">
            {paginatedSales.map((sale) => (
              <article
                key={sale.id}
                className="grid gap-4 bg-white/92 px-5 py-4 md:grid-cols-[minmax(0,1fr)_220px_150px]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-olive-dark">{sale.saleCode}</h2>
                    <span className="rounded-full bg-earth/10 px-2.5 py-1 text-[11px] font-semibold text-earth">
                      {sale.channel || "Sin nombre"}
                    </span>
                    {sale.hasNegativeStock ? (
                      <span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-700">
                        Stock base negativo
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-foreground/62">{formatDateTime(sale.soldAt)}</p>
                  <p className="mt-3 text-sm leading-6 text-foreground/68">
                    {sale.notes || "Sin observaciones."}
                  </p>
                  <p className="mt-3 text-sm text-foreground/62">
                    {sale.items
                      .slice(0, 3)
                      .map((item) => `${item.productName} · ${item.presentationLabel}`)
                      .join(" · ") || "Sin ítems"}
                    {sale.items.length > 3 ? ` +${sale.items.length - 3} más` : ""}
                  </p>
                </div>

                <div className="space-y-2 text-sm text-olive-dark">
                  <div className="rounded-2xl border border-olive/10 bg-olive-soft/26 px-3 py-2">
                    <strong>Ítems</strong>
                    <div>{sale.itemCount}</div>
                  </div>
                  <div className="rounded-2xl border border-olive/10 bg-olive-soft/26 px-3 py-2">
                    <strong>Total</strong>
                    <div>{formatARS(sale.totalCents / 100)}</div>
                  </div>
                  <div className="rounded-2xl border border-olive/10 bg-olive-soft/26 px-3 py-2">
                    <strong>Margen</strong>
                    <div>{formatARS(sale.totalMarginCents / 100)}</div>
                  </div>
                </div>

                <div className="flex items-start justify-start md:justify-end">
                  <Link
                    href={`/admin/sales/${sale.id}`}
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
              totalItems={filteredSales.length}
              onPageChange={setPage}
              onPageSizeChange={(nextPageSize) => {
                setPageSize(nextPageSize);
                setPage(1);
              }}
              itemLabel="ventas"
            />
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="text-lg font-semibold text-olive-dark">No encontramos ventas con esa búsqueda.</p>
            <p className="mt-2 text-sm leading-6 text-foreground/66">
              Probá con otro cliente, código o nombre de producto.
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
  tone = "default",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "warn";
}) {
  return (
    <article className="surface-panel organic-outline rounded-[1.8rem] p-5">
      <p className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${tone === "warn" ? "text-red-700" : "text-olive-dark"}`}>
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-foreground/64">{detail}</p>
    </article>
  );
}

function matchesSale(sale: SaleRecord, query: string) {
  if (!query) {
    return true;
  }

  const searchableValues = [
    sale.saleCode,
    sale.channel,
    sale.notes,
    ...sale.items.flatMap((item) => [item.productName, item.presentationLabel]),
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
