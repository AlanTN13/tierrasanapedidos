"use client";

import { useId, useRef } from "react";

export type AlertProductItem = {
  id: string;
  name: string;
  detail: string;
  note?: string;
};

type AlertProductsModalProps = {
  label: string;
  value: string;
  description: string;
  title: string;
  emptyText: string;
  items: AlertProductItem[];
  tone?: "default" | "warn";
};

export function AlertProductsModal({
  label,
  value,
  description,
  title,
  emptyText,
  items,
  tone = "default",
}: AlertProductsModalProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="admin-metric text-left"
      >
        <p className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">{label}</p>
        <p className={`mt-2 text-3xl font-semibold ${tone === "warn" ? "text-red-700" : "text-olive-dark"}`}>
          {value}
        </p>
        <p className="mt-2 text-sm text-foreground/64">{description}</p>
      </button>

      <dialog ref={dialog} className="admin-dialog" aria-labelledby={titleId} onClick={(event) => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.current?.close(); } }}>
            <div className="flex items-center justify-between gap-4 border-b border-olive/10 px-5 py-4">
              <div>
                <h2 id={titleId} className="text-xl font-semibold text-olive-dark">{title}</h2>
                <p className="mt-1 text-sm text-foreground/64">
                  {items.length} producto{items.length === 1 ? "" : "s"} en esta alerta
                </p>
              </div>
              <button
                type="button"
                onClick={() => dialog.current?.close()}
                className="inline-flex items-center justify-center rounded-full border border-olive/14 bg-white px-4 py-2 text-sm font-semibold text-olive-dark hover:bg-olive-soft/36"
              >
                Cerrar
              </button>
            </div>

            <div className="admin-dialog-body">
              {items.length > 0 ? (
                <div className="grid gap-px bg-olive/8">
                  {items.map((item) => (
                    <div key={item.id} className="bg-white/92 px-5 py-4">
                      <div className="text-sm font-semibold text-olive-dark">{item.name}</div>
                      <div className="mt-1 text-sm text-foreground/68">{item.detail}</div>
                      {item.note ? (
                        <div className="mt-1 text-sm text-foreground/58">{item.note}</div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-5 py-10 text-sm text-foreground/64">{emptyText}</div>
              )}
            </div>
      </dialog>
    </>
  );
}
