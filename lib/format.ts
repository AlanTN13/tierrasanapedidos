export function formatARS(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatQuantity(value: number) {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 3,
  }).format(value);
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatSaleCode(
  saleNumber: number | null | undefined,
  fallbackId?: string,
) {
  if (typeof saleNumber === "number" && Number.isFinite(saleNumber) && saleNumber > 0) {
    return `TS-${String(Math.trunc(saleNumber)).padStart(6, "0")}`;
  }

  if (fallbackId) {
    return `TS-${fallbackId.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
  }

  return "TS-pendiente";
}

export function toDateTimeLocalValue(value: string) {
  const date = new Date(value);
  const timezoneOffset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - timezoneOffset * 60_000);
  return localDate.toISOString().slice(0, 16);
}
