"use client";

import { AdminForm } from "@/components/admin/admin-form";
import type { AdminFormAction } from "@/lib/admin-form-result";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import type {
  AdminPresentationOption,
  AdminPurchaseProductOption,
} from "@/lib/admin-operations";
import { formatARS, formatQuantity, toDateTimeLocalValue } from "@/lib/format";

type TransactionFormProps = {
  mode: "purchase" | "sale";
  options: AdminPresentationOption[] | AdminPurchaseProductOption[];
  action: AdminFormAction;
};

type TransactionRow = {
  key: string;
  optionId: string;
  searchTerm: string;
  quantity: string;
  unitAmount: string;
};

const INITIAL_ROW_COUNT = 1;

export function TransactionForm({ mode, options, action }: TransactionFormProps) {
  const [rows, setRows] = useState<TransactionRow[]>(createInitialRows);
  const dateInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    // Initialize the native input after hydration in the operator's local time.
    // Keep it uncontrolled so a failed save retains the chosen date.
    if (dateInput.current && !dateInput.current.value) {
      dateInput.current.value = toDateTimeLocalValue(new Date().toISOString());
    }
  }, []);
  const [activeRowKey, setActiveRowKey] = useState<string | null>(null);
  const isSale = mode === "sale";
  const deferredRows = useDeferredValue(rows);

  function updateRow(key: string, patch: Partial<TransactionRow>) {
    setRows((currentRows) =>
      currentRows.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  }

  function handleOptionChange(key: string, optionId: string) {
    const option = options.find((item) => item.id === optionId);

    updateRow(key, {
      optionId,
      searchTerm: option?.displayName ?? "",
      unitAmount: option
        ? formatCentsAsInput(
            isSale
              ? (option as AdminPresentationOption).salePriceCents
              : (option as AdminPurchaseProductOption).lastPurchaseUnitCostCents ?? 0,
          )
        : "",
    });
    setActiveRowKey(null);
    requestAnimationFrame(() => document.getElementById(`quantity-${key}`)?.focus());
  }

  function handleSearchChange(key: string, value: string) {
    updateRow(key, {
      searchTerm: value,
      optionId: "",
      unitAmount: "",
    });
    setActiveRowKey(key);
  }

  function addRow() {
    setRows((currentRows) => [...currentRows, createRow()]);
  }

  const filledRows = rows.filter((row) => row.optionId && row.quantity && row.unitAmount);
  const totalCents = filledRows.reduce((sum, row) => {
    const quantity = parseInputNumber(row.quantity);
    const unitAmount = parseInputNumber(row.unitAmount);

    return sum + Math.round(quantity * unitAmount * 100);
  }, 0);

  return (
    <AdminForm action={action} className="transaction-form">
      <section className="transaction-info surface-panel p-4">
        <div className="grid gap-4 md:grid-cols-2">
          {isSale ? (
            <>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-olive-dark">Fecha y hora</span>
                <input
                  name="soldAt"
                  type="datetime-local"
                  ref={dateInput}
                  defaultValue=""
                  className="w-full rounded-lg border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-olive-dark">
                  Nombre del cliente (opcional)
                </span>
                <input
                  name="channel"
                  placeholder="Ej: Juan Perez"
                  className="w-full rounded-lg border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
                />
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
                  className="w-full rounded-lg border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-olive-dark">Nro. comprobante</span>
                <input
                  name="referenceNumber"
                  placeholder="FAC-000123"
                  className="w-full rounded-lg border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-olive-dark">Fecha y hora</span>
                <input
                  name="purchasedAt"
                  type="datetime-local"
                  ref={dateInput}
                  defaultValue=""
                  className="w-full rounded-lg border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
                />
              </label>
            </>
          )}

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-olive-dark">Notas</span>
            <textarea
              name="notes"
              rows={2}
              placeholder={
                isSale
                  ? "Opcional: aclaraciones sobre la venta."
                  : "Opcional: forma de entrega, observaciones o condiciones."
              }
              className="w-full rounded-lg border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
            />
          </label>
        </div>
      </section>

      <section className="transaction-items surface-panel p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-olive-dark">
              {isSale ? "Ítems de la venta" : "Ítems de la compra"}
            </h2>
            <p className="text-sm text-foreground/64">
              {isSale
                ? "Elegí la presentación exacta que vendiste. El sistema descuenta el stock base real del producto según sus gramos, ml o unidades."
                : "Elegí el producto base de la compra. La cantidad se carga en kg, litros o unidades y después se convierte al stock real."}
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
            const option = options.find((item) => item.id === row.optionId);
            const purchaseOption = !isSale ? (option as AdminPurchaseProductOption | undefined) : undefined;
            const quantityLabel = isSale
              ? "Cantidad"
              : purchaseOption?.purchaseUnitLabel === "kg"
                ? "Kilo"
                : purchaseOption?.purchaseUnitLabel === "l"
                  ? "Litro"
                  : "Unidad";
            const deferredRow = deferredRows.find((item) => item.key === row.key) ?? row;
            const filteredOptions = isSale
              ? getFilteredPresentationOptions(
                  options as AdminPresentationOption[],
                  deferredRow.searchTerm,
                )
              : getFilteredPurchaseOptions(
                  options as AdminPurchaseProductOption[],
                  deferredRow.searchTerm,
                );
            const lineTotal =
              parseInputNumber(row.quantity) > 0 && parseInputNumber(row.unitAmount) >= 0
                ? Math.round(parseInputNumber(row.quantity) * parseInputNumber(row.unitAmount) * 100)
                : 0;

            return (
              <div
                key={row.key}
                className="transaction-line"
              >
                <div className="relative space-y-2">
                  <label htmlFor={`search-${row.key}`} className="text-xs font-semibold text-earth">Producto / presentación</label>
                  <input
                    id={`search-${row.key}`}
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={activeRowKey === row.key}
                    aria-controls={`suggestions-${row.key}`}
                    onKeyDown={(event) => {
                      if(event.key === "Escape") setActiveRowKey(null);
                      if(event.key === "ArrowDown") { event.preventDefault(); setActiveRowKey(row.key); requestAnimationFrame(() => document.getElementById(`suggestions-${row.key}`)?.querySelector("button")?.focus()); }
                      if(event.key === "Enter" && activeRowKey === row.key) { event.preventDefault(); if(filteredOptions.length === 1) handleOptionChange(row.key, filteredOptions[0].id); }
                    }}
                    value={row.searchTerm}
                    onChange={(event) => handleSearchChange(row.key, event.target.value)}
                    onFocus={() => setActiveRowKey(row.key)}
                    onBlur={(event) => {
                      if (!event.currentTarget.parentElement?.contains(event.relatedTarget as Node | null)) setActiveRowKey(null);
                    }}
                    placeholder={isSale ? "Buscar presentación" : "Buscar producto"}
                    className="w-full rounded-lg border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
                  />
                  <input
                    type="hidden"
                    name={isSale ? "linePresentationId" : "lineProductId"}
                    value={row.optionId}
                  />
                  {activeRowKey === row.key ? (
                    <div id={`suggestions-${row.key}`} role="listbox" aria-label="Presentaciones y productos encontrados" className="transaction-suggestions"
                      onBlur={(event) => { if (!event.currentTarget.parentElement?.contains(event.relatedTarget as Node | null)) setActiveRowKey(null); }}
                      onKeyDown={(event) => {
                        if(event.key === "Escape") { event.preventDefault(); document.getElementById(`search-${row.key}`)?.focus(); setActiveRowKey(null); }
                        if(event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); const buttons=Array.from(event.currentTarget.querySelectorAll("button")); const index=buttons.indexOf(event.target as HTMLButtonElement); buttons[(index+(event.key==="ArrowDown"?1:-1)+buttons.length)%buttons.length]?.focus(); }
                      }}>
                      {!filteredOptions.length ? <p className="p-3 text-sm">No encontramos resultados. Probá con nombre o SKU.</p> : null}
                      {filteredOptions.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          role="option"
                          aria-selected={row.optionId === item.id}
                          onClick={() => handleOptionChange(row.key, item.id)}
                          className="block w-full rounded-[1rem] px-3 py-3 text-left hover:bg-olive-soft/36"
                        >
                          <div className="text-sm font-semibold text-olive-dark">
                            {item.displayName}
                          </div>
                          <div className="mt-1 text-xs text-foreground/62">
                            Stock base: {item.stockCurrentBaseLabel} ·{" "}
                            {isSale
                              ? `Precio ${formatARS(
                                  (item as AdminPresentationOption).salePriceCents / 100,
                                )}`
                              : purchaseCostLabel(item as AdminPurchaseProductOption)}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <div className="transaction-options-detail">
                    {option ? (
                      isSale ? (
                        <details><summary>Ver stock y equivalencias</summary>
                          <div>
                            SKU: {(option as AdminPresentationOption).presentationSku}
                          </div>
                          <div>
                            Presentación: {(option as AdminPresentationOption).presentationLabel}. Si
                            cargás 3, son 3 presentaciones de este tipo.
                          </div>
                          <div>
                            Stock base actual: {(option as AdminPresentationOption).stockCurrentBaseLabel}
                            {(option as AdminPresentationOption).stockCurrentBaseUnits < 0
                              ? " (negativo)"
                              : ""}
                          </div>
                          <div>
                            Equivale a{" "}
                            {formatQuantity(
                              (option as AdminPresentationOption).stockEquivalentQuantity,
                            )}{" "}
                            presentaciones de{" "}
                            {(option as AdminPresentationOption).presentationLabel}.
                          </div>
                          <div>
                            Precio catálogo:{" "}
                            {formatARS(
                              (option as AdminPresentationOption).salePriceCents / 100,
                            )}
                          </div>
                        </details>
                      ) : (
                        <details><summary>Ver stock y unidad de compra</summary>
                          <div>Producto base: {(option as AdminPurchaseProductOption).productName}.</div>
                          <div>SKU base: {(option as AdminPurchaseProductOption).baseSku}</div>
                          <div>
                            Stock base actual: {(option as AdminPurchaseProductOption).stockCurrentBaseLabel}
                            {(option as AdminPurchaseProductOption).stockCurrentBaseUnits < 0
                              ? " (negativo)"
                              : ""}
                          </div>
                          <div>
                            Cargá la compra en {(option as AdminPurchaseProductOption).purchaseUnitLabel}.
                          </div>
                          <div>
                            {purchaseCostLabel(option as AdminPurchaseProductOption)}
                          </div>
                        </details>
                      )
                    ) : (
                      <span>Fila {index + 1}. Dejala vacía si no la necesitás.</span>
                    )}
                  </div>
                </div>

                <label className="space-y-2">
                  <span className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">
                    {quantityLabel}
                  </span>
                  <input
                    id={`quantity-${row.key}`}
                    name="lineQuantity"
                    value={row.quantity}
                    onChange={(event) => updateRow(row.key, { quantity: event.target.value })}
                    placeholder="1"
                    inputMode="decimal"
                    className="w-full rounded-lg border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
                  />
                  <p className="text-xs leading-5 text-foreground/58">
                    {isSale
                      ? "Cuántas presentaciones vendiste."
                      : purchaseOption?.purchaseUnitLabel === "kg"
                        ? "Cuántos kilos compraste."
                        : purchaseOption?.purchaseUnitLabel === "l"
                          ? "Cuántos litros compraste."
                          : "Cuántas unidades compraste."}
                  </p>
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
                    className="w-full rounded-lg border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
                  />
                </label>

                <div className="transaction-line-total space-y-2">
                  <span className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">
                    Total línea
                  </span>
                  <div className="rounded-lg border border-olive/10 bg-olive-soft/24 px-4 py-3 text-sm font-semibold text-olive-dark">
                    {lineTotal > 0 ? formatARS(lineTotal / 100) : "Sin datos"}
                  </div>
                </div>
                <button type="button" className="transaction-remove admin-button" aria-label={`Quitar fila ${index+1}`} onClick={()=>setRows((current)=>current.filter((item)=>item.key!==row.key))}>×</button>
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

      </section>
      <aside className="transaction-summary surface-panel" aria-label="Resumen de la operación">
        <div><p className="text-xs font-semibold text-earth">Total de la {isSale ? "venta" : "compra"}</p><p className="mt-1 text-2xl font-semibold" aria-live="polite">{formatARS(totalCents / 100)}</p><p className="admin-muted">{filledRows.length} filas completas</p></div>
        <p className="admin-muted hidden xl:block">Revisá producto, unidad y cantidad antes de guardar. El stock se actualiza al confirmar la operación.</p>
        <button type="submit" className="admin-button admin-button--primary">{isSale ? "Guardar venta" : "Guardar compra"}</button>
      </aside>
    </AdminForm>
  );
}

function createInitialRows() {
  return Array.from({ length: INITIAL_ROW_COUNT }, (_, index) => createRow(`initial-${index}`));
}

function createRow(key?: string): TransactionRow {
  return {
    key: key ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    optionId: "",
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

function getFilteredPresentationOptions(options: AdminPresentationOption[], searchTerm: string) {
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

function getFilteredPurchaseOptions(options: AdminPurchaseProductOption[], searchTerm: string) {
  const normalizedSearchTerm = normalizeSearchText(searchTerm);

  if (!normalizedSearchTerm) {
    return options.slice(0, 8);
  }

  return options
    .filter((item) =>
      normalizeSearchText(`${item.displayName} ${item.productSlug} ${item.productName}`).includes(
        normalizedSearchTerm,
      ),
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

function purchaseCostLabel(option: AdminPurchaseProductOption) {
  return option.lastPurchaseUnitCostCents != null && option.lastPurchaseUnitCostCents > 0
    ? `Último costo ${formatARS(option.lastPurchaseUnitCostCents / 100)} por ${option.purchaseUnitLabel}`
    : "Sin costo registrado";
}
