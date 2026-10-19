"use client";

import Link from "next/link";

export default function AdminError({ error, unstable_retry }: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <section role="alert" className="surface-panel max-w-2xl space-y-4 rounded-3xl p-6">
      <h1 className="font-display text-3xl font-semibold text-olive-dark">No pudimos cargar esta pantalla</h1>
      <p className="text-sm leading-6 text-foreground/70">
        Hubo un problema al cargar la información. Podés intentar de nuevo o volver al resumen.
        Si estabas guardando, revisá el listado antes de repetir la operación.
      </p>
      {error.digest ? <p className="text-xs text-foreground/60">Referencia para soporte: {error.digest}</p> : null}
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => unstable_retry()} className="rounded-full bg-olive px-5 py-3 text-sm font-semibold text-white">Intentar de nuevo</button>
        <Link href="/admin" className="rounded-full border border-olive/20 px-5 py-3 text-sm font-semibold text-olive-dark">Volver al resumen</Link>
      </div>
    </section>
  );
}
