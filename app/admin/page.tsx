import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { signOutAdmin } from "@/app/admin/actions";
import { getAdminCategories, getAdminProducts } from "@/lib/catalog-data";
import { requireAdminUser } from "@/lib/supabase/admin";

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminPageFallback />}>
      <AdminPageContent />
    </Suspense>
  );
}

async function AdminPageContent() {
  await connection();
  const admin = await requireAdminUser();
  const [products, categories] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
  ]);
  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));

  return (
    <main className="container-shell py-8 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="section-kicker">Backoffice</span>
          <h1 className="mt-3 font-display text-4xl font-semibold text-olive-dark">
            Catálogo
          </h1>
          <p className="mt-2 text-sm leading-6 text-foreground/66">
            Sesión iniciada como {admin.email}.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/categories"
            className="inline-flex items-center justify-center rounded-full border border-olive/14 bg-white px-5 py-3 text-sm font-semibold text-olive-dark hover:bg-olive-soft/36"
          >
            Gestionar categorías
          </Link>
          <Link
            href="/admin/export"
            className="inline-flex items-center justify-center rounded-full border border-olive/14 bg-white px-5 py-3 text-sm font-semibold text-olive-dark hover:bg-olive-soft/36"
          >
            Descargar CSV
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center rounded-full bg-olive px-5 py-3 text-sm font-semibold text-white hover:bg-olive-dark"
          >
            Nuevo producto
          </Link>
          <form action={signOutAdmin}>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full border border-olive/14 bg-white px-5 py-3 text-sm font-semibold text-olive-dark hover:bg-olive-soft/36"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="surface-panel organic-outline rounded-[1.8rem] p-5">
          <p className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">
            Productos
          </p>
          <p className="mt-2 text-3xl font-semibold text-olive-dark">{products.length}</p>
          <p className="mt-2 text-sm text-foreground/64">
            Incluye activos e inactivos del catálogo.
          </p>
        </div>

        <div className="surface-panel organic-outline rounded-[1.8rem] p-5">
          <p className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">
            Categorías
          </p>
          <p className="mt-2 text-3xl font-semibold text-olive-dark">{categories.length}</p>
          <p className="mt-2 text-sm text-foreground/64">
            Ya podés crearlas y editarlas desde el backoffice.
          </p>
        </div>

        <div className="surface-panel organic-outline rounded-[1.8rem] p-5">
          <p className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">
            Acceso rápido
          </p>
          <div className="mt-3">
            <Link
              href="/admin/categories/new"
              className="inline-flex items-center justify-center rounded-full bg-olive px-4 py-2 text-sm font-semibold text-white hover:bg-olive-dark"
            >
              Alta de categoría
            </Link>
          </div>
          <p className="mt-3 text-sm text-foreground/64">
            Ideal para sumar nuevas líneas sin tocar código.
          </p>
        </div>
      </section>

      <section className="mt-6 surface-panel organic-outline overflow-hidden rounded-[2rem]">
        <div className="grid gap-px bg-olive/8">
          {products.map((product) => (
            <article
              key={product.uuid}
              className="grid gap-4 bg-white/92 px-5 py-4 md:grid-cols-[minmax(0,1fr)_220px_150px]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-olive-dark">{product.name}</h2>
                  {product.isFeatured ? (
                    <span className="rounded-full bg-earth/10 px-2.5 py-1 text-[11px] font-semibold text-earth">
                      Destacado
                    </span>
                  ) : null}
                  {!product.isActive ? (
                    <span className="rounded-full bg-foreground/8 px-2.5 py-1 text-[11px] font-semibold text-foreground/72">
                      Inactivo
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-foreground/62">/{product.slug}</p>
                <p className="mt-3 text-sm leading-6 text-foreground/68">
                  {product.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.categoryIds.map((categoryId) => (
                    <span
                      key={categoryId}
                      className="rounded-full bg-olive-soft/48 px-2.5 py-1 text-[11px] font-semibold text-olive-dark"
                    >
                      {categoryNameById.get(categoryId) ?? categoryId}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2 text-sm text-olive-dark">
                {product.presentations.map((presentation) => (
                  <div
                    key={`${product.uuid}-${presentation.id ?? presentation.etiqueta}`}
                    className="rounded-2xl border border-olive/10 bg-olive-soft/26 px-3 py-2"
                  >
                    <strong>{presentation.etiqueta}</strong>
                    <div>${presentation.precio.toLocaleString("es-AR")}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-start justify-start md:justify-end">
                <Link
                  href={`/admin/products/${product.slug}`}
                  className="inline-flex items-center justify-center rounded-full border border-olive/14 bg-white px-4 py-2 text-sm font-semibold text-olive-dark hover:bg-olive-soft/36"
                >
                  Editar
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function AdminPageFallback() {
  return (
    <main className="container-shell py-8 sm:py-10">
      <div>
        <span className="section-kicker">Backoffice</span>
        <h1 className="mt-3 font-display text-4xl font-semibold text-olive-dark">
          Catálogo
        </h1>
        <p className="mt-2 text-sm leading-6 text-foreground/66">
          Cargando productos...
        </p>
      </div>
    </main>
  );
}
