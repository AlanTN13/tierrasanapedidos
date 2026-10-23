"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { formatCartMoney, promotionConditions, promotionStatus } from "@/lib/promotions";
import { trackCampaign } from "@/lib/campaign-events";

const DISMISSED_KEY = "tierra-sana-noviembre-2026-dismissed";
const FIRST_VISIT_KEY = "tierra-sana-noviembre-2026-first-visit";
const FIRST_VISIT_DELAY = 8000;
let dismissedInMemory = false;
let firstVisitInMemory: number | null = null;

function isDismissed() {
  try { return dismissedInMemory || sessionStorage.getItem(DISMISSED_KEY) === "1"; }
  catch { return dismissedInMemory; }
}

function remainingFirstVisitDelay() {
  const current = Date.now();
  let firstVisit = firstVisitInMemory;
  try {
    const saved = sessionStorage.getItem(FIRST_VISIT_KEY);
    if (saved !== null && Number.isFinite(Number(saved))) firstVisit = Number(saved);
  } catch { /* Memory preserves timing during navigation when storage is unavailable. */ }
  if (firstVisit === null || firstVisit > current) {
    firstVisit = current;
    try { sessionStorage.setItem(FIRST_VISIT_KEY, String(firstVisit)); } catch { /* Memory fallback. */ }
  }
  firstVisitInMemory = firstVisit;
  return Math.max(0, FIRST_VISIT_DELAY - (current - firstVisit));
}

export function PromotionPopup() {
  const { promotion, now, isOpen, applyCoupon, openCart } = useCart();
  const ref = useRef<HTMLDialogElement>(null);
  const [copyMessage, setCopyMessage] = useState("");
  const active = promotionStatus(promotion, now) === "applied";

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !active || isDismissed()) { dialog?.close(); return; }
    const delay = remainingFirstVisitDelay();
    if (isOpen) { dialog.close(); return; }
    let timeout: number;
    function showWhenAvailable() {
      if (!dialog || isDismissed()) return;
      const focused = document.activeElement;
      if (document.hidden || document.querySelector('dialog[open], [role="dialog"]') ||
        (focused instanceof HTMLElement && focused.matches("input, textarea, select, [contenteditable=true]"))) {
        timeout = window.setTimeout(showWhenAvailable, 1000);
        return;
      }
      dialog.showModal();
      trackCampaign("promotion_view");
    }
    timeout = window.setTimeout(showWhenAvailable, delay);
    return () => { window.clearTimeout(timeout); dialog.close(); };
  }, [active, isOpen]);

  function dismiss() {
    dismissedInMemory = true;
    try { sessionStorage.setItem(DISMISSED_KEY, "1"); } catch { /* Memory fallback. */ }
    ref.current?.close();
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(promotion.code);
      setCopyMessage("¡Código copiado!");
      trackCampaign("promotion_copy");
    } catch { setCopyMessage(`Copiá el código: ${promotion.code}`); }
  }

  return (
    <dialog ref={ref} aria-labelledby="promotion-title" aria-describedby="promotion-conditions"
      onCancel={() => { dismiss(); trackCampaign("promotion_dismiss"); }}
      onClick={(event) => { if (event.target === event.currentTarget) { dismiss(); trackCampaign("promotion_dismiss"); } }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-[2rem] border border-olive/15 bg-[#fffdf9] p-6 text-olive-dark shadow-2xl backdrop:bg-[#2f3328]/45 sm:p-8">
      <div className="flex justify-end">
        <button type="button" autoFocus aria-label="Cerrar promoción" onClick={() => { dismiss(); trackCampaign("promotion_dismiss"); }}
          className="h-10 w-10 rounded-full bg-olive-soft text-xl focus-visible:outline-2 focus-visible:outline-olive">×</button>
      </div>
      <p className="text-xs font-semibold tracking-[0.15em] uppercase text-earth">Noviembre Tierra Sana</p>
      <h2 id="promotion-title" className="mt-3 text-2xl font-semibold leading-tight">¡Tu compra tiene premio!</h2>
      <p className="my-5 text-6xl font-bold tracking-tight text-olive">{promotion.percent}% <span className="text-3xl">OFF</span></p>
      <p className="text-base">En compras superiores a <strong>{formatCartMoney(promotion.minimumCents)}</strong>.</p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-olive/35 bg-olive-soft/35 p-4">
        <span className="select-all text-lg font-bold tracking-wider">{promotion.code}</span>
        <button type="button" onClick={copyCode} className="rounded-full px-3 py-2 text-sm font-semibold underline focus-visible:outline-2 focus-visible:outline-olive">Copiar código</button>
      </div>
      <p role="status" className="mt-2 min-h-5 text-sm">{copyMessage}</p>
      <button type="button" onClick={() => { applyCoupon(promotion.code); dismiss(); openCart(); }}
        className="mt-3 w-full rounded-full bg-olive px-4 py-3.5 font-semibold text-white hover:bg-olive-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive">Aplicar al carrito</button>
      <p id="promotion-conditions" className="mt-4 text-xs leading-5 text-foreground/70">{promotionConditions(promotion)}</p>
    </dialog>
  );
}
