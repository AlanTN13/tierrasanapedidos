"use client";

import { useActionState, useDeferredValue, useMemo, useState } from "react";
import { ListPagination } from "@/components/admin/list-pagination";
import { SearchBar } from "@/components/search-bar";
import {
  type AdminPresentationOption,
  type AdminPurchaseProductOption,
  type StockMovementDashboardMetrics,
  type StockMovementRecord,
} from "@/lib/admin-operations";
import { formatDateTime, formatQuantity } from "@/lib/format";
import {
  saveStockMovement,
  type StockMovementFormState,
} from "@/app/admin/operations/actions";

type StockMovementsPanelProps = {
  dashboardMetrics: StockMovementDashboardMetrics;
  movements: StockMovementRecord[];
  productOptions: AdminPurchaseProductOption[];
  presentationOptions: AdminPresentationOption[];
};

const INITIAL_FORM_STATE: StockMovementFormState = {
  error: null,
};

const REASON_OPTIONS = [
  "Ajuste positivo",
  "Devolución",
  "Corrección por diferencia",
  "Merma",
  "Rotura",
  "Vencimiento",
  "Consumo interno",
  "Corrección negativa",
  "Ajuste administrativo",
] as const;

const MOVEMENT_TYPE_LABEL: Record<"entry" | "exit" | "set", string> = {
  entry: "Entrada",
  exit: "Salida",
  set: "Ajuste absoluto",
};

export function StockMovementsPanel({
  dashboardMetrics,
  movements,
  productOptions,
  presentationOptions,
}: StockMovementsPanelProps) {
  const [formState, formAction, isPending] = useActionState(
    saveStockMovement,
    INITIAL_FORM_STATE,
  );
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedPresentationId, setSelectedPresentationId] = useState("");
  const [movementType, setMovementType] = useState<"entry" | "exit" | "set">("entry");
  const [quantityInput, setQuantityInput] = useState("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "entry" | "exit" | "set">("all");
  const [reasonFilter, setReasonFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const deferredQuery = useDeferredValue(query);

  const selectedProduct = productOptions.find((item) => item.productId === selectedProductId) ?? null;
  const productPresentations = useMemo(
    () =>
      presentationOptions
        .filter((item) => item.productId === selectedProductId)
        .sort((a, b) => a.presentationLabel.localeCompare(b.presentationLabel, "es")),
    [presentationOptions, selectedProductId],
  );
  const selectedPresentation = productPresentations.find((item) => item.id === selectedPresentationId) ?? null;
  const preview = buildMovementPreview(selectedProduct, selectedPresentation, movementType, quantityInput);
  const normalizedQuery = normalizeText(deferredQuery);
  const filteredMovements = movements.filter((movement) => {
    if (typeFilter !== "all" && movement.movementType !== typeFilter) {
      return false;
    }

    if (reasonFilter !== "all" && movement.reason !== reasonFilter) {
      return false;
    }

    if (dateFilter && !movement.createdAt.startsWith(dateFilter)) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = normalizeText([
      movement.productName,
      movement.presentationLabel,
      movement.reason,
      movement.notes,
      movement.createdByEmail,
    ].join(" "));

    return haystack.includes(normalizedQuery);
  });
  const totalPages = Math.max(1, Math.ceil(filteredMovements.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedMovements = filteredMovements.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Ajustes hoy"
          value={String(dashboardMetrics.movementsToday)}
          detail="Movimientos manuales cargados hoy"
        />
        <SummaryCard
          label="Entradas manuales"
          value={String(dashboardMetrics.manualEntriesToday)}
          detail="Movimientos que sumaron stock"
        />
        <SummaryCard
          label="Salidas manuales"
          value={String(dashboardMetrics.manualExitsToday)}
          detail="Movimientos que descontaron stock"
        />
        <SummaryCard
          label="Productos afectados"
          value={String(dashboardMetrics.productsAffectedToday)}
          detail="Productos tocados hoy"
        />
      </section>

      <form action={formAction} className="space-y-6">
        <section className="surface-panel organic-outline rounded-[2rem] p-5 sm:p-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-olive-dark">Nuevo movimiento manual</h2>
            <p className="text-sm leading-6 text-foreground/66">
              Ajustá stock con trazabilidad. Si elegís una presentación, la cantidad se convierte
              automáticamente al stock base del producto.
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="space-y-2 xl:col-span-2">
              <span className="text-sm font-semibold text-olive-dark">Producto</span>
              <select
                name="productId"
                value={selectedProductId}
                onChange={(event) => {
                  setSelectedProductId(event.target.value);
                  setSelectedPresentationId("");
                }}
                className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
                required
              >
                <option value="">Elegí un producto</option>
                {productOptions.map((option) => (
                  <option key={option.productId} value={option.productId}>
                    {option.productName} · {option.baseSku}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-olive-dark">Presentación opcional</span>
              <select
                name="presentationId"
                value={selectedPresentationId}
                onChange={(event) => setSelectedPresentationId(event.target.value)}
                disabled={!selectedProduct}
                className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none disabled:cursor-not-allowed disabled:bg-olive-soft/16 focus:ring-2 focus:ring-olive/20"
              >
                <option value="">Aplicar sobre stock base</option>
                {productPresentations.map((presentation) => (
                  <option key={presentation.id} value={presentation.id}>
                    {presentation.presentationLabel} · {presentation.presentationSku || "Sin SKU"}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-olive-dark">Tipo</span>
              <select
                name="movementType"
                value={movementType}
                onChange={(event) =>
                  setMovementType(event.target.value as "entry" | "exit" | "set")
                }
                className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
              >
                <option value="entry">Entrada</option>
                <option value="exit">Salida</option>
                <option value="set">Ajuste absoluto</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-olive-dark">Cantidad</span>
              <input
                name="quantity"
                value={quantityInput}
                onChange={(event) => setQuantityInput(event.target.value)}
                inputMode="decimal"
                placeholder="0"
                className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
                required
              />
              <p className="text-xs leading-5 text-foreground/58">
                {selectedPresentation
                  ? movementType === "set"
                    ? `Ingresá el stock físico real en ${selectedPresentation.presentationLabel}.`
                    : `Cada unidad impacta ${selectedPresentation.amountInBaseUnits} base.`
                  : selectedProduct
                    ? `Se carga en ${getBaseUnitLabel(selectedProduct.measurementKind)}.`
                    : "Elegí primero un producto para ver la unidad."}
              </p>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-olive-dark">Motivo</span>
              <select
                name="reason"
                className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
                required
                defaultValue=""
              >
                <option value="" disabled>
                  Elegí un motivo
                </option>
                {REASON_OPTIONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 md:col-span-2 xl:col-span-3">
              <span className="text-sm font-semibold text-olive-dark">Notas</span>
              <textarea
                name="notes"
                rows={3}
                placeholder="Opcional: detalle del conteo, referencia, observación o contexto."
                className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
              />
            </label>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <PreviewCard
              label="Stock actual"
              value={preview.currentStockLabel}
              detail={selectedProduct ? "Antes del movimiento" : "Elegí un producto"}
            />
            <PreviewCard
              label="Impacto"
              value={preview.impactLabel}
              detail={preview.impactDetail}
              tone={preview.resultingStockValid ? "default" : "warn"}
            />
            <PreviewCard
              label="Stock resultante"
              value={preview.resultingStockLabel}
              detail={
                preview.resultingStockValid
                  ? "Cómo quedará al guardar"
                  : "No se permite dejar stock negativo"
              }
              tone={preview.resultingStockValid ? "default" : "warn"}
            />
          </div>

          {formState.error ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formState.error}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-foreground/62">
              El ajuste siempre se guarda como movimiento. No modifica stock en silencio.
            </p>
            <button
              type="submit"
              disabled={isPending || !preview.ready || !preview.resultingStockValid}
              className="inline-flex items-center justify-center rounded-full bg-olive px-5 py-3 text-sm font-semibold text-white hover:bg-olive-dark disabled:cursor-not-allowed disabled:bg-olive/50"
            >
              {isPending ? "Registrando..." : "Registrar movimiento"}
            </button>
          </div>
        </section>
      </form>

      <section className="surface-panel organic-outline rounded-[2rem] p-5 sm:p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_180px_180px_180px] xl:items-end">
          <div>
            <p className="text-sm font-semibold text-olive-dark">Buscar movimientos</p>
            <p className="mt-1 text-sm leading-6 text-foreground/66">
              Filtrá por producto, motivo, usuario o notas.
            </p>
          </div>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-olive-dark">Tipo</span>
            <select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value as typeof typeFilter);
                setPage(1);
              }}
              className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
            >
              <option value="all">Todos</option>
              <option value="entry">Entradas</option>
              <option value="exit">Salidas</option>
              <option value="set">Ajuste absoluto</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-olive-dark">Motivo</span>
            <select
              value={reasonFilter}
              onChange={(event) => {
                setReasonFilter(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
            >
              <option value="all">Todos</option>
              {REASON_OPTIONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-olive-dark">Fecha</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(event) => {
                setDateFilter(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
            />
          </label>
        </div>

        <div className="mt-4">
          <SearchBar
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder="Buscar por producto, motivo, nota o usuario..."
            srLabel="Buscar movimientos de stock"
          />
        </div>
      </section>

      <section className="surface-panel organic-outline overflow-hidden rounded-[2rem]">
        {filteredMovements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-olive/8">
              <thead className="bg-olive-soft/28">
                <tr className="text-left text-[11px] font-semibold tracking-[0.14em] text-earth uppercase">
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Presentación</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Cantidad</th>
                  <th className="px-4 py-3">Stock anterior</th>
                  <th className="px-4 py-3">Stock nuevo</th>
                  <th className="px-4 py-3">Motivo</th>
                  <th className="px-4 py-3">Usuario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-olive/8 bg-white text-sm text-olive-dark">
                {paginatedMovements.map((movement) => (
                  <tr key={movement.id}>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(movement.createdAt)}</td>
                    <td className="px-4 py-3 font-semibold">{movement.productName}</td>
                    <td className="px-4 py-3">{movement.presentationLabel ?? "Stock base"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${movementBadgeClassName(movement.movementType)}`}>
                        {MOVEMENT_TYPE_LABEL[movement.movementType]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>{movement.quantityLabel}</div>
                      <div className="text-xs text-foreground/60">
                        Impacto {movement.quantityBaseLabel}
                      </div>
                    </td>
                    <td className="px-4 py-3">{movement.previousStockLabel}</td>
                    <td className="px-4 py-3">{movement.newStockLabel}</td>
                    <td className="px-4 py-3">
                      <div>{movement.reason}</div>
                      {movement.notes ? (
                        <div className="text-xs text-foreground/60">{movement.notes}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">{movement.createdByEmail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ListPagination
              page={currentPage}
              pageSize={pageSize}
              totalItems={filteredMovements.length}
              onPageChange={setPage}
              onPageSizeChange={(nextPageSize) => {
                setPageSize(nextPageSize);
                setPage(1);
              }}
              itemLabel="movimientos"
            />
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="text-lg font-semibold text-olive-dark">
              No encontramos movimientos con esos filtros.
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground/66">
              Probá con otro producto, fecha o motivo.
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

function PreviewCard({
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
    <article className="rounded-[1.8rem] border border-olive/10 bg-white p-5">
      <p className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${tone === "warn" ? "text-red-700" : "text-olive-dark"}`}>
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-foreground/64">{detail}</p>
    </article>
  );
}

function buildMovementPreview(
  product: AdminPurchaseProductOption | null,
  presentation: AdminPresentationOption | null,
  movementType: "entry" | "exit" | "set",
  quantityInput: string,
) {
  const currentStockBaseUnits = product?.stockCurrentBaseUnits ?? 0;
  const measurementKind = product?.measurementKind ?? "unit";
  const factor = presentation?.amountInBaseUnits ?? 1;
  const quantityValue = parseOptionalQuantity(quantityInput, movementType === "set");
  const safeQuantityValue = quantityValue ?? 0;
  const targetBaseUnits = safeQuantityValue * factor;
  const deltaBaseUnits =
    movementType === "set"
      ? targetBaseUnits - currentStockBaseUnits
      : targetBaseUnits * (movementType === "entry" ? 1 : -1);
  const resultingStock = currentStockBaseUnits + deltaBaseUnits;

  return {
    ready: Boolean(product) && quantityValue != null,
    currentStockLabel: formatBaseQuantity(currentStockBaseUnits, measurementKind),
    impactLabel:
      quantityValue != null
        ? `${deltaBaseUnits >= 0 ? "+" : ""}${formatBaseQuantity(deltaBaseUnits, measurementKind)}`
        : "—",
    impactDetail:
      movementType === "set"
        ? "Diferencia entre sistema y conteo físico"
        : movementType === "entry"
          ? "Se suma al stock disponible"
          : "Se descuenta del stock disponible",
    resultingStockLabel:
      quantityValue != null
        ? formatBaseQuantity(resultingStock, measurementKind)
        : "—",
    resultingStockValid: resultingStock >= 0,
  };
}

function formatBaseQuantity(value: number, measurementKind: AdminPurchaseProductOption["measurementKind"]) {
  if (measurementKind === "unit") {
    const suffix = Math.abs(value) === 1 ? "unidad" : "unidades";
    return `${formatQuantity(value)} ${suffix}`;
  }

  const useLargeUnit = Math.abs(value) >= 1000;
  const normalizedValue = useLargeUnit ? value / 1000 : value;
  const unit =
    measurementKind === "weight"
      ? useLargeUnit
        ? "kg"
        : "g"
      : useLargeUnit
        ? "l"
        : "ml";

  return `${formatQuantity(normalizedValue)} ${unit}`;
}

function getBaseUnitLabel(measurementKind: AdminPurchaseProductOption["measurementKind"]) {
  if (measurementKind === "weight") {
    return "g";
  }

  if (measurementKind === "volume") {
    return "ml";
  }

  return "unidades";
}

function parseOptionalQuantity(value: string, allowZero = false) {
  const normalized = value.trim().replace(",", ".");
  const amount = Number.parseFloat(normalized);
  if (!Number.isFinite(amount)) {
    return null;
  }

  if (allowZero ? amount < 0 : amount <= 0) {
    return null;
  }

  return amount;
}

function movementBadgeClassName(movementType: StockMovementRecord["movementType"]) {
  if (movementType === "entry") {
    return "bg-olive-soft/60 text-olive-dark";
  }

  if (movementType === "exit") {
    return "bg-red-100 text-red-700";
  }

  return "bg-earth/12 text-earth";
}

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}
