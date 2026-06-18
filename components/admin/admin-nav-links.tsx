"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Resumen", shortLabel: "RS", match: "/admin" },
  { href: "/admin/home", label: "Home", shortLabel: "HM", match: "/admin/home" },
  { href: "/admin/products", label: "Productos", shortLabel: "PR", match: "/admin/products" },
  { href: "/admin/stock-movements", label: "Movimientos", shortLabel: "MV", match: "/admin/stock-movements" },
  { href: "/admin/categories", label: "Categorías", shortLabel: "CT", match: "/admin/categories" },
  { href: "/admin/purchases", label: "Compras", shortLabel: "CP", match: "/admin/purchases" },
  { href: "/admin/sales", label: "Ventas", shortLabel: "VT", match: "/admin/sales" },
];

export function AdminNavLinks({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <>
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.match);

        if (mobile) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-mobile-nav__item ${
                isActive ? "admin-mobile-nav__item--active" : ""
              }`}
            >
              {item.label}
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`admin-nav__item ${isActive ? "admin-nav__item--active" : ""}`}
          >
            <span className="admin-nav__badge">{item.shortLabel}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );
}
