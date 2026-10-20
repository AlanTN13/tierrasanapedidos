import { Suspense } from "react";
import { connection } from "next/server";
import { signInAdmin } from "@/app/admin/login/actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type AdminLoginPageProps = {
  searchParams?: Promise<{
    email?: string;
    error?: string;
    next?: string;
    reason?: string;
    signedOut?: string;
  }>;
};

const reasonCopy: Record<string, string> = {
  "missing-config": "El acceso administrativo no está disponible. Contactá a soporte.",
  "not-admin": "Tu cuenta no tiene acceso a la administración comercial. Pedí que revisen tus permisos.",
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
  const nextPath = normalizeNextPath(resolvedSearchParams?.next);
  const wantsRecipeModule = nextPath.startsWith("/admin/recipes");
  const reason = resolvedSearchParams?.reason
    ? reasonCopy[resolvedSearchParams.reason]
    : null;
  const error = resolvedSearchParams?.error;
  const signedOut = resolvedSearchParams?.signedOut === "1";

  return (
    <section className="py-6 sm:py-8">
      <div className="mx-auto max-w-xl">
        <div className="surface-panel organic-outline rounded-[2.1rem] p-6 sm:p-8">
          <span className="section-kicker">Acceso de administración</span>
          <h1 className="mt-3 font-display text-4xl leading-[0.98] font-semibold text-olive-dark">
            Ingresar a Tierra Sana
          </h1>
          <p className="mt-4 text-sm leading-6 text-foreground/68">
            {wantsRecipeModule
              ? "Ingresá con tu cuenta para administrar las recetas."
              : "Ingresá con tu cuenta para consultar el negocio y registrar operaciones."}
          </p>

          {!isConfigured ? (
            <div className="mt-4 rounded-lg border border-earth/15 bg-earth/8 p-4 text-sm text-olive-dark">
              El acceso no está disponible en este momento. Contactá a soporte para habilitarlo.
            </div>
          ) : null}

          {reason ? (
            <div className="mt-4 rounded-lg border border-earth/15 bg-earth/8 p-4 text-sm text-olive-dark">
              {reason}
            </div>
          ) : null}

          {error ? (
            <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {signedOut ? (
            <div role="status" className="mt-4 rounded-lg border border-olive/12 bg-olive-soft/36 p-4 text-sm text-olive-dark">
              Sesión cerrada.
            </div>
          ) : null}

          <form action={signInAdmin} className="mt-6 space-y-4">
            <input type="hidden" name="next" value={nextPath} />
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-olive-dark">Email</span>
              <input
                type="email"
                name="email"
                required
                placeholder="tierrasanadietetica@gmail.com"
                autoComplete="email"
                className="w-full rounded-lg border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
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
                className="w-full rounded-lg border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
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

          <p className="mt-4 text-xs leading-5 text-foreground/58">
            Si necesitás acceso, pedíselo a quien administra Tierra Sana.
          </p>
        </div>
      </div>
    </section>
  );
}

function normalizeNextPath(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/admin";
  }

  return value;
}

function AdminLoginFallback() {
  return (
    <section className="py-6 sm:py-8">
      <div className="mx-auto max-w-xl">
        <div className="surface-panel organic-outline rounded-[2.1rem] p-6 sm:p-8">
          <span className="section-kicker">Acceso de administración</span>
          <h1 className="mt-3 font-display text-4xl leading-[0.98] font-semibold text-olive-dark">
            Ingresar a Tierra Sana
          </h1>
          <p className="mt-4 text-sm leading-6 text-foreground/68">
            Cargando acceso al admin...
          </p>
        </div>
      </div>
    </section>
  );
}
