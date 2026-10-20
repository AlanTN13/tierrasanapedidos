import { Suspense, type ReactNode } from "react";
import Image from "next/image";
import { signOutAdmin } from "@/app/admin/auth-actions";
import { AdminContextHeader, AdminNavLinks } from "@/components/admin/admin-nav-links";
import "./admin.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-shell min-h-screen">
      <div className="admin-shell__frame">
        <aside className="admin-sidebar">
          <div className="admin-sidebar__brand">
            <div className="admin-sidebar__logo">
              <Image
                src="/logo-tierra-sana-header.png"
                alt="Logo Tierra Sana"
                width={48}
                height={48}
                className="admin-sidebar__logo-image"
              />
            </div>
            <div>
              <p className="admin-sidebar__title">Tierra Sana</p>
              <p className="admin-sidebar__eyebrow">Gestión comercial</p>
            </div>
          </div>

          <nav className="admin-nav" aria-label="Módulos">
            <Suspense fallback={null}>
              <AdminNavLinks />
            </Suspense>
          </nav>

          <div className="admin-sidebar__footer">
            <p className="admin-sidebar__hint">
              Tierra Sana ERP · V3
            </p>
            <form action={signOutAdmin}>
              <button type="submit" className="admin-sidebar__logout">
                Cerrar sesión
              </button>
            </form>
          </div>
        </aside>

        <div className="admin-content">
          <header className="admin-topbar">
            <Suspense fallback={null}>
              <AdminNavLinks mobile footer={<form action={signOutAdmin}><button type="submit" className="admin-sidebar__logout">Cerrar sesión</button></form>} />
              <AdminContextHeader />
            </Suspense>
          </header>

          <main id="main-content" className="admin-main">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
