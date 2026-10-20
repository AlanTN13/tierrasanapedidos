import type { ReactNode } from "react";

export function AdminMetric({ label, value, detail, warning = false }: { label: string; value: string; detail: string; warning?: boolean }) {
  return <article className="admin-metric"><p className="admin-metric__label">{label}</p><p className={`admin-metric__value ${warning ? "admin-warning-text" : ""}`}>{value}</p><p className="admin-muted">{detail}</p></article>;
}
export function AdminEmpty({ children }: { children: ReactNode }) {
  return <div className="admin-empty">{children}</div>;
}
export function AdminBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" | "danger" }) {
  return <span className={`admin-badge admin-badge--${tone}`}>{children}</span>;
}
