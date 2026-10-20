"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export function AdminShellFrame({ children, sidebar, header }: {
  children: ReactNode;
  sidebar: ReactNode;
  header: ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return (
      <div className="admin-shell min-h-screen">
        <main id="main-content" className="admin-login-main">{children}</main>
      </div>
    );
  }

  return (
    <div className="admin-shell min-h-screen">
      <div className="admin-shell__frame">
        {sidebar}
        <div className="admin-content">
          {header}
          <main id="main-content" className="admin-main">{children}</main>
        </div>
      </div>
    </div>
  );
}
