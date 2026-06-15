"use client";

import { useDeferredValue, useState } from "react";
import type { AdminPresentationOption } from "@/lib/admin-operations";
import { formatARS, formatQuantity, toDateTimeLocalValue } from "@/lib/format";

type TransactionFormProps = {
  mode: "purchase" | "sale";
  options: AdminPresentationOption[];
  action: (formData: FormData) => Promise<void>;
};

type TransactionRow = {
  key: string;
  presentationId: string;
  searchTerm: string;
  quantity: string;
  unitAmount: string;
};

const INITIAL_ROW_COUNT = 3;

export function TransactionForm({ mode, options, action }: TransactionFormProps) {
  const [rows, setRows] = useState<TransactionRow[]>(createInitialRows());
  const [activeRowKey, setActiveRowKey] = useState<string | null>(null);
  const isSale = mode === "sale";
  const deferredRows = useDeferredValue(rows);

  function updateRow(key: string, patch: Partial<TransactionRow>) {
    setRows((currentRows) =>
      currentRows.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  }

  function handlePresentationChange(key: string, presentationId: string) {
    const option = options.find((item) => item.id === presentationId);

    updateRow(key, {
      presentationId,
      searchTerm: option?.displayName ?? "",
      unitAmount: option
        ? formatCentsAsInput(isSale ? option.salePriceCents : option.lastUnitCostCents ?? 0)
        : "",
    });
    setActiveRowKey(null);
  }

  function handleSearchChange(key: string, value: string) {
    updateRow(key, {
      searchTerm: value,
      presentationId: "",
      unitAmount: "",
    });
    setActiveRowKey(key);
  }

  function addRow() {
    setRows((currentRows) => [...currentRows, createRow()]);
  }

  const filledRows = rows.filter((row) => row.presentationId && row.quantity && row.unitAmount);
  const totalCents = filledRows.reduce((sum, row) => {
    const quantity = parseInputNumber(row.quantity);
    const unitAmount = parseInputNumber(row.unitAmount);

    return sum + Math.round(quantity * unitAmount * 100);
  }, 0);

  return (
    <form action={action} className="space-y-6">
      <section className="surface-panel organic-outline rounded-[1.8rem] p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          {isSale ? (
            <>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-olive-dark">Fecha y hora</span>
                <input
                  name="soldAt"
                  type="datetime-local"
                  defaultValue={toDateTimeLocalValue(new Date().toISOString())}
                  className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-olive-dark">Canal</span>
                <select
                  name="channel"
                  defaultValue="local"
                  className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
                >
                  <option value="local">Local</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="other">Otro</option>
                </select>
              </label>
            </>
          ) : (
            <>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-olive-dark">Proveedor</span>
                <input
                  name="supplierName"
                  placeholder="Distribuidora Natural"
                  required
                  className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-olive-dark">Nro. comprobante</span>
                <input
                  name="referenceNumber"
                  placeholder="FAC-000123"
                  className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-olive-dark">Fecha y hora</span>
                <input
                  name="purchasedAt"
                  type="datetime-local"
                  defaultValue={toDateTimeLocalValue(new Date().toISOString())}
                  className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
                />
              </label>
            </>
          )}

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-olive-dark">Notas</span>
            <textarea
              name="notes"
              rows={3}
              placeholder={
                isSale
                  ? "Opcional: aclaraciones sobre la venta."
                  : "Opcional: forma de entrega, observaciones o condiciones."
              }
              className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
            />
          </label>
        </div>
      </section>

      <section className="surface-panel organic-outline rounded-[1.8rem] p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-olive-dark">
              {isSale ? "Ítems de la venta" : "Ítems de la compra"}
            </h2>
            <p className="text-sm text-foreground/64">
              {isSale
                ? "Elegí la presentación exacta del producto. La cantidad siempre representa cuántas presentaciones vendiste."
                : "Elegí la presentación exacta del producto. La cantidad siempre representa cuántas presentaciones compraste."}
            </p>
          </div>

          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center justify-center rounded-full border border-olive/14 bg-white px-4 py-2 text-sm font-semibold text-olive-dark hover:bg-olive-soft/36"
          >
            Agregar fila
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {rows.map((row, index) => {
            const option = options.find((item) => item.id === row.presentationId);
            const deferredRow = deferredRows.find((item) => item.key === row.key) ?? row;
            const filteredOptions = getFilteredOptions(options, deferredRow.searchTerm);
            const lineTotal =
              parseInputNumber(row.quantity) > 0 && parseInputNumber(row.unitAmount) >= 0
                ? Math.round(parseInputNumber(row.quantity) * parseInputNumber(row.unitAmount) * 100)
                : 0;

            return (
              <div
                key={row.key}
                className="grid gap-3 rounded-2xl border border-olive/12 bg-white/90 p-4 md:grid-cols-[minmax(0,1.3fr)_130px_140px_160px]"
              >
                <label className="relative space-y-2">
                  <span className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">
                    Producto
                  </span>
                  <input
                    value={row.searchTerm}
                    onChange={(event) => handleSearchChange(row.key, event.target.value)}
                    onFocus={() => setActiveRowKey(row.key)}
                    onBlur={() => {
                      window.setTimeout(() => {
                        setActiveRowKey((currentKey) => (currentKey === row.key ? null : currentKey));
                      }, 150);
                    }}
                    placeholder="Buscar presentación"
                    className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
                  />
                  <input type="hidden" name="linePresentationId" value={row.presentationId} />
                  {activeRowKey === row.key && filteredOptions.length > 0 ? (
                    <div className="absolute top-[5.4rem] z-20 max-h-64 w-full overflow-auto rounded-[1.4rem] border border-olive/14 bg-white p-2 shadow-[0_20px_40px_rgba(63,74,47,0.12)]">
                      {filteredOptions.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            handlePresentationChange(row.key, item.id);
                          }}
                          className="block w-full rounded-[1rem] px-3 py-3 text-left hover:bg-olive-soft/36"
                        >
                          <div className="text-sm font-semibold text-olive-dark">
                            {item.displayName}
                          </div>
                          <div className="mt-1 text-xs text-foreground/62">
                            Stock: {formatQuantity(item.stockCurrent)} ·{" "}
                            {isSale
                              ? `Precio ${formatARS(item.salePriceCents / 100)}`
                              : `Último costo ${formatARS((item.lastUnitCostCents ?? 0) / 100)}`}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <div className="min-h-9 text-xs leading-5 text-foreground/58">
                    {option ? (
                      <>
                        <div>
                          Presentación: {option.presentationLabel}. Si cargás 3, son 3 presentaciones
                          de este tipo.
                        </div>
                        <div>
                          Stock actual: {formatQuantity(option.stockCurrent)}
                          {option.stockCurrent < 0 ? " (negativo)" : ""}
                        </div>
                        <div>
                          {isSale ? "Precio catálogo" : "Último costo"}:{" "}
                          {formatARS(
                            ((isSale
                              ? option.salePriceCents
                              : option.lastUnitCostCents ?? 0) || 0) / 100,
                          )}
                        </div>
                      </>
                    ) : (
                      <span>Fila {index + 1}. Dejala vacía si no la necesitás.</span>
                    )}
                  </div>
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">
                    Cant. present.
                  </span>
                  <input
                    name="lineQuantity"
                    value={row.quantity}
                    onChange={(event) => updateRow(row.key, { quantity: event.target.value })}
                    placeholder="1"
                    inputMode="decimal"
                    className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">
                    {isSale ? "Precio (ARS)" : "Costo (ARS)"}
                  </span>
                  <input
                    name={isSale ? "lineUnitPrice" : "lineUnitCost"}
                    value={row.unitAmount}
                    onChange={(event) => updateRow(row.key, { unitAmount: event.target.value })}
                    placeholder={isSale ? "9500" : "6200"}
                    inputMode="decimal"
                    className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
                  />
                </label>

                <div className="space-y-2">
                  <span className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">
                    Total línea
                  </span>
                  <div className="rounded-2xl border border-olive/10 bg-olive-soft/24 px-4 py-3 text-sm font-semibold text-olive-dark">
                    {lineTotal > 0 ? formatARS(lineTotal / 100) : "Sin datos"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center justify-center rounded-full border border-olive/14 bg-white px-4 py-2 text-sm font-semibold text-olive-dark hover:bg-olive-soft/36"
          >
            Agregar otra fila
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-[1.6rem] border border-olive/10 bg-olive-soft/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">
              Resumen
            </p>
            <p className="mt-1 text-sm text-foreground/66">
              {filledRows.length} filas completas listas para guardar.
            </p>
          </div>
          <p className="text-lg font-semibold text-olive-dark">{formatARS(totalCents / 100)}</p>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-olive px-5 py-3 text-sm font-semibold text-white hover:bg-olive-dark"
        >
          {isSale ? "Guardar venta" : "Guardar compra"}
        </button>
      </div>
    </form>
  );
}

function createInitialRows() {
  return Array.from({ length: INITIAL_ROW_COUNT }, () => createRow());
}

function createRow(): TransactionRow {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    presentationId: "",
    searchTerm: "",
    quantity: "",
    unitAmount: "",
  };
}

function parseInputNumber(value: string) {
  const normalized = normalizeDecimalInput(value);
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCentsAsInput(value: number) {
  return value > 0 ? String(Math.round(value / 100)) : "";
}

function normalizeDecimalInput(value: string) {
  const trimmed = value.trim();

  if (trimmed.includes(",") && trimmed.includes(".")) {
    return trimmed.replace(/\./g, "").replace(",", ".");
  }

  if (trimmed.includes(",")) {
    return trimmed.replace(",", ".");
  }

  return trimmed;
}

function getFilteredOptions(options: AdminPresentationOption[], searchTerm: string) {
  const normalizedSearchTerm = normalizeSearchText(searchTerm);

  if (!normalizedSearchTerm) {
    return options.slice(0, 8);
  }

  return options
    .filter((item) =>
      normalizeSearchText(
        `${item.displayName} ${item.productSlug} ${item.productName} ${item.presentationLabel}`,
      ).includes(normalizedSearchTerm),
    )
    .slice(0, 8);
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}
