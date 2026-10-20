"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const NAV_GROUPS = [
  { label: "Operación", items: [
    { href: "/admin", label: "Resumen", icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" },
    { href: "/admin/sales", label: "Ventas", icon: "M5 3h14v18l-3-2-4 2-4-2-3 2zM9 7h6M9 11h6" },
    { href: "/admin/purchases", label: "Compras", icon: "M3 4h2l3 12h10l3-9H6M9 21h.01M18 21h.01" },
    { href: "/admin/products", label: "Productos", icon: "m12 3 9 5v9l-9 5-9-5V8zM3 8l9 5 9-5M12 13v9" },
    { href: "/admin/stock-movements", label: "Inventario", icon: "M3 7h17m-4-4 4 4-4 4M21 17H4m4-4-4 4 4 4" },
  ] },
  { label: "Administración web", items: [
    { href: "/admin/home", label: "Home de la web", icon: "m3 10 9-7 9 7M5 9v12h14V9M9 21v-8h6v8" },
    { href: "/admin/categories", label: "Categorías", icon: "M3 3h7l11 11-7 7L3 10zM7 7h.01" },
    { href: "/admin/recipes", label: "Recetas", icon: "M12 5c-4-3-8-2-10-1v16c4-2 7-1 10 1 3-2 6-3 10-1V4c-2-1-6-2-10 1ZM12 5v16" },
  ] },
];
function activeRoute(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}
export function AdminNavLinks({ mobile = false, footer }: { mobile?: boolean; footer?: ReactNode }) {
  const pathname = usePathname();
  const groups = NAV_GROUPS.map((group) => (
    <div className="admin-nav-group" key={group.label}>
      <p className="admin-nav-group__label">{group.label}</p>
      {group.items.map((item) => {
        const active = activeRoute(pathname, item.href);
        return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}
          className={`admin-nav__item ${active ? "admin-nav__item--active" : ""}`}
          onClick={(event) => { const menu = event.currentTarget.closest("details"); if (menu) menu.open = false; }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={item.icon} /></svg>
          <span>{item.label}</span>
        </Link>;
      })}
    </div>
  ));
  return mobile ? <details className="admin-mobile-menu" onKeyDown={(event) => {
    if (event.key === "Escape") { event.currentTarget.open = false; event.currentTarget.querySelector("summary")?.focus(); }
  }}>
    <summary><span aria-hidden="true">☰</span> Módulos</summary>
    <nav aria-label="Módulos en celular">{groups}{footer}</nav>
  </details> : <>{groups}</>;
}
export function AdminContextHeader() {
  const pathname = usePathname();
  const current = NAV_GROUPS.flatMap((group) => group.items).find((item) => activeRoute(pathname, item.href));
  return <div className="admin-context"><span>Gestión comercial</span><span aria-hidden="true">/</span><strong>{current?.label ?? "Administración"}</strong><Link href="/" target="_blank" rel="noopener noreferrer">Ver tienda ↗</Link></div>;
}
