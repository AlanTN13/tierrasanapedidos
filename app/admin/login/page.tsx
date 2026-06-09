import { Suspense } from "react";
import { connection } from "next/server";
import { signInAdmin } from "@/app/admin/login/actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type AdminLoginPageProps = {
  searchParams?: Promise<{
    email?: string;
    error?: string;
    reason?: string;
    signedOut?: string;
  }>;
};

const reasonCopy: Record<string, string> = {
  "missing-config": "Faltan variables de entorno de Supabase para habilitar el admin.",
  "not-admin": "Tu cuenta autenticó, pero no figura en la tabla admin_users.",
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  return (
    <Suspense fallback={<AdminLoginFallback />}>
      <AdminLoginContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AdminLoginContent({
  searchParams,
}: AdminLoginPageProps) {
  await connection();
  const resolvedSearchParams = await searchParams;
  const isConfigured = isSupabaseConfigured();
  const reason = resolvedSearchParams?.reason
    ? reasonCopy[resolvedSearchParams.reason]
    : null;
  const error = resolvedSearchParams?.error;
  const signedOut = resolvedSearchParams?.signedOut === "1";

  return (
    <main className="container-shell py-8 sm:py-12">
      <div className="mx-auto max-w-xl">
        <div className="surface-panel organic-outline rounded-[2.1rem] p-6 sm:p-8">
          <span className="section-kicker">Backoffice</span>
          <h1 className="mt-3 font-display text-4xl leading-[0.98] font-semibold text-olive-dark">
            Administrar catálogo
          </h1>
          <p className="mt-4 text-sm leading-6 text-foreground/68">
            Ingresá con email y contraseña. El usuario además tiene que existir en la
            tabla
            <code className="mx-1 rounded bg-olive-soft/50 px-1.5 py-0.5 text-xs">
              admin_users
            </code>
            de Supabase.
          </p>

          {!isConfigured ? (
            <div className="mt-5 rounded-[1.4rem] border border-earth/15 bg-earth/8 p-4 text-sm text-olive-dark">
              Configuración pendiente: definí
              <code className="mx-1 rounded bg-white px-1.5 py-0.5 text-xs">
                NEXT_PUBLIC_SUPABASE_URL
              </code>
              y
              <code className="mx-1 rounded bg-white px-1.5 py-0.5 text-xs">
                NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
              </code>
              para habilitar el admin.
            </div>
          ) : null}

          {reason ? (
            <div className="mt-5 rounded-[1.4rem] border border-earth/15 bg-earth/8 p-4 text-sm text-olive-dark">
              {reason}
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-[1.4rem] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {signedOut ? (
            <div className="mt-5 rounded-[1.4rem] border border-olive/12 bg-olive-soft/36 p-4 text-sm text-olive-dark">
              Sesión cerrada.
            </div>
          ) : null}

          <form action={signInAdmin} className="mt-6 space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-olive-dark">Email</span>
              <input
                type="email"
                name="email"
                required
                placeholder="tierrasanadietetica@gmail.com"
                autoComplete="email"
                className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-olive-dark">Contraseña</span>
              <input
                type="password"
                name="password"
                required
                placeholder="Tu contraseña"
                autoComplete="current-password"
                className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
              />
            </label>

            <button
              type="submit"
              disabled={!isConfigured}
              className="inline-flex items-center justify-center rounded-full bg-olive px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-olive/50"
            >
              Ingresar
            </button>
          </form>

          <p className="mt-5 text-xs leading-5 text-foreground/58">
            Si en el futuro usás recovery o magic link, mantené la confirmación de
            Supabase apuntando a
            <code className="mx-1 rounded bg-olive-soft/50 px-1.5 py-0.5">
              /auth/confirm?token_hash=...&type=email
            </code>
            .
          </p>
        </div>
      </div>
    </main>
  );
}

function AdminLoginFallback() {
  return (
    <main className="container-shell py-8 sm:py-12">
      <div className="mx-auto max-w-xl">
        <div className="surface-panel organic-outline rounded-[2.1rem] p-6 sm:p-8">
          <span className="section-kicker">Backoffice</span>
          <h1 className="mt-3 font-display text-4xl leading-[0.98] font-semibold text-olive-dark">
            Administrar catálogo
          </h1>
          <p className="mt-4 text-sm leading-6 text-foreground/68">
            Cargando acceso al admin...
          </p>
        </div>
      </div>
    </main>
  );
}
