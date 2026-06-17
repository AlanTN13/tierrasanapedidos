"use client";

import { useState } from "react";

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
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="surface-panel organic-outline block w-full rounded-[1.8rem] p-5 text-left transition hover:bg-white/90"
      >
        <p className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">{label}</p>
        <p className={`mt-2 text-3xl font-semibold ${tone === "warn" ? "text-red-700" : "text-olive-dark"}`}>
          {value}
        </p>
        <p className="mt-2 text-sm text-foreground/64">{description}</p>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-olive-dark/30 p-4">
          <div className="surface-panel organic-outline max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-[2rem]">
            <div className="flex items-center justify-between gap-4 border-b border-olive/10 px-5 py-4">
              <div>
                <h2 className="text-xl font-semibold text-olive-dark">{title}</h2>
                <p className="mt-1 text-sm text-foreground/64">
                  {items.length} producto{items.length === 1 ? "" : "s"} en esta alerta
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-full border border-olive/14 bg-white px-4 py-2 text-sm font-semibold text-olive-dark hover:bg-olive-soft/36"
              >
                Cerrar
              </button>
            </div>

            <div className="max-h-[65vh] overflow-auto">
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
          </div>
        </div>
      ) : null}
    </>
  );
}
