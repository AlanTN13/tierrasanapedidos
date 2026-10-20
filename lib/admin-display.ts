// Read-only presentation helpers. Do not change persisted costs, margins or units.
type CostItem = { unitCostSnapshotCents: number; usesEstimatedCost: boolean };
export function costState(items: readonly CostItem[]): "registered" | "estimated" | "missing" {
  if (items.length === 0 || items.some((item) => !Number.isFinite(item.unitCostSnapshotCents) || item.unitCostSnapshotCents <= 0)) return "missing";
  return items.some((item) => item.usesEstimatedCost) ? "estimated" : "registered";
}
export const COST_LABELS = { registered: "Costo registrado", estimated: "Costo estimado", missing: "Costo incompleto" } as const;
export function normalizeAdminText(value: string | null | undefined) {
  return (value ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}
export function matchesAdminDate(value: string, from: string, to: string) {
  if (!from && !to) return true;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return false;
  const key = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
  return (!from || key >= from) && (!to || key <= to);
}

export function formatAdminDateTime(value: string) {
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short", hour12: false, timeZone: "America/Argentina/Buenos_Aires" }).format(new Date(value)).replace(/[\u00a0\u202f]/g, " ");
}
