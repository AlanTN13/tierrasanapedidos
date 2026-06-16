import { Suspense, type ReactNode } from "react";
import { signOutAdmin } from "@/app/admin/actions";
import { AdminNavLinks } from "@/components/admin/admin-nav-links";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-shell min-h-screen">
      <div className="admin-shell__bg" />
      <div className="admin-shell__frame">
        <aside className="admin-sidebar">
          <div className="admin-sidebar__brand">
            <div className="admin-sidebar__logo">TS</div>
            <div>
              <p className="admin-sidebar__eyebrow">Backoffice</p>
              <h1 className="admin-sidebar__title">Tierra Sana</h1>
            </div>
          </div>

          <nav className="admin-nav" aria-label="Módulos">
            <Suspense fallback={null}>
              <AdminNavLinks />
            </Suspense>
          </nav>

          <div className="admin-sidebar__footer">
            <p className="admin-sidebar__hint">
              Home, catálogo, compras y ventas en una sola vista operativa.
            </p>
            <form action={signOutAdmin}>
              <button type="submit" className="admin-sidebar__logout">
                Cerrar sesión
              </button>
            </form>
          </div>
        </aside>

        <div className="admin-content">
          <div className="admin-mobile-nav">
            <Suspense fallback={null}>
              <AdminNavLinks mobile />
            </Suspense>
          </div>

          <main id="main-content" className="admin-main">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
