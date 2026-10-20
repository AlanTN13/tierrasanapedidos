"use client";

import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { UNKNOWN_SAVE_ERROR, type AdminFormAction, type AdminFormResult } from "@/lib/admin-form-result";

type AdminFormProps = {
  action: AdminFormAction;
  children: ReactNode;
  className?: string;
};

export function AdminForm({ action, children, className = "space-y-4" }: AdminFormProps) {
  const [result, setResult] = useState<AdminFormResult | null>(null);
  const [isPending, setIsPending] = useState(false);
  const submitting = useRef(false);
  const resume = useRef<AdminFormResult["resume"]>(undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const messageId = useId();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    // Capture before disabling controls. Using onSubmit avoids React's automatic form reset,
    // retaining uncontrolled inputs, checkboxes and the selected file on an unsuccessful save.
    const data = new FormData(event.currentTarget);
    if (resume.current) {
      data.set("productId", resume.current.productId);
      data.set("existingImagePath", resume.current.existingImagePath);
    }
    setResult(null);
    setIsPending(true);
    try {
      const nextResult = await action(data);
      if (nextResult?.error) {
        if (nextResult.resume) resume.current = nextResult.resume;
        setResult(nextResult);
        requestAnimationFrame(() => alertRef.current?.focus());
      }
    } catch {
      // Network and unexpected action failures must not replace the form or expose internals.
      setResult({ error: UNKNOWN_SAVE_ERROR });
      requestAnimationFrame(() => alertRef.current?.focus());
    } finally {
      submitting.current = false;
      setIsPending(false);
    }
  }

  function focusField() {
    if (!result?.field) return;
    const controls = formRef.current?.querySelectorAll<HTMLElement>(
      `[name="${CSS.escape(result.field)}"]`,
    );
    controls?.[result.fieldIndex ?? 0]?.focus();
  }

  return (
    <form ref={formRef} method="post" onSubmit={handleSubmit} className={className} aria-busy={isPending}>
      {result ? (
        <div ref={alertRef} tabIndex={-1} role="alert" aria-labelledby={messageId}
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 outline-none focus:ring-2 focus:ring-red-300">
          <p id={messageId} className="font-semibold">Revisá el guardado</p>
          <p className="mt-2">{result.error}</p>
          {result.reference ? <p className="mt-2 text-xs">Referencia para soporte: {result.reference}</p> : null}
          {result.field ? <button type="button" onClick={focusField} className="mt-3 font-semibold underline">Revisar el campo</button> : null}
        </div>
      ) : null}
      {isPending ? <p role="status" className="text-sm font-semibold text-olive-dark">Guardando… esperá la confirmación.</p> : null}
      <fieldset disabled={isPending} className="space-y-4 disabled:opacity-60">{children}</fieldset>
      {result ? <p className="text-sm text-red-800">{result.error}</p> : null}
    </form>
  );
}
