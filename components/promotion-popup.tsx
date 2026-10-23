"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { formatCartMoney, promotionConditions, promotionDeadline, promotionStatus } from "@/lib/promotions";
import { trackCampaign } from "@/lib/campaign-events";

const DISMISSED_KEY = "tierra-sana-noviembre-2026-dismissed";
const HOME_POPUP_DELAY = 1000;
let dismissedInMemory = false;

function isDismissed() {
  try { return dismissedInMemory || sessionStorage.getItem(DISMISSED_KEY) === "1"; }
  catch { return dismissedInMemory; }
}

export function PromotionPopup() {
  const { promotion, now, isOpen, isPreview, applyCoupon, openCart } = useCart();
  const ref = useRef<HTMLDialogElement>(null);
  const [copyMessage, setCopyMessage] = useState("");
  const active = promotionStatus(promotion, now) === "applied";

  useEffect(() => {
    const dialog = ref.current;
    const onHome = window.location.pathname === "/";
    if (!dialog || !active || (!onHome && !isPreview) || isDismissed()) { dialog?.close(); return; }
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
    timeout = window.setTimeout(showWhenAvailable, HOME_POPUP_DELAY);
    return () => { window.clearTimeout(timeout); dialog.close(); };
  }, [active, isOpen, isPreview]);

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
      className="fixed inset-0 m-auto max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-[680px] overflow-y-auto rounded-[1.75rem] border border-[#e7e1d3] bg-[#fcf8ef] p-0 text-olive-dark shadow-[0_32px_100px_rgba(20,30,15,0.3)] backdrop:bg-[#1e281b]/55 backdrop:backdrop-blur-sm sm:rounded-[2rem]">
      <div className="relative grid sm:grid-cols-[0.85fr_1.15fr]">
        <button type="button" autoFocus aria-label="Cerrar promoción" onClick={() => { dismiss(); trackCampaign("promotion_dismiss"); }}
          className="absolute top-3 right-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e4dfd2] bg-[#fcf8ef] text-olive-dark transition hover:bg-[#ebe6d8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive sm:top-4 sm:right-4">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>

        <div className="relative isolate flex flex-col justify-between overflow-hidden bg-[#455638] px-7 pt-6 pb-7 text-[#fcf8ef] sm:px-8 sm:py-10">
          <svg aria-hidden="true" viewBox="0 0 220 320" fill="none" className="pointer-events-none absolute -right-12 -bottom-16 -z-10 h-80 w-56 text-[#afbf96]/20 sm:-right-10 sm:-bottom-8 sm:h-96 sm:w-64" stroke="currentColor" strokeWidth="1.3">
            <path d="M42 318C85 242 105 155 158 28M102 193C39 192 20 154 25 125c50 2 79 26 77 68ZM123 141c2-58 31-93 73-96-2 47-28 84-73 96ZM77 254c-40-1-67-25-70-62 44-3 68 20 70 62ZM144 91c-35-8-51-36-45-67 34 8 51 31 45 67Z" />
          </svg>
          <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#e6eddc]">Tierra Sana</p>
          <div className="mt-4 flex items-end gap-3 sm:my-10 sm:block">
            <p className="font-display text-[5.5rem] leading-[0.85] tracking-[-0.065em] sm:text-[7rem]">{promotion.percent}<span className="align-top text-[2.5rem] leading-none sm:text-[3rem]">%</span></p>
            <p className="pb-1 text-xl font-medium tracking-[0.2em] sm:mt-5 sm:pb-0 sm:text-2xl">OFF</p>
          </div>
          <p className="mt-4 hidden text-xs tracking-wide text-[#e6eddc] sm:block">Válido hasta el {promotionDeadline(promotion)}</p>
        </div>

        <div className="px-6 pt-7 pb-6 sm:px-8 sm:pt-14 sm:pb-8">
          <h2 id="promotion-title" className="max-w-[15rem] font-display text-[2rem] leading-[1.08] tracking-[-0.035em] text-[#35432d] sm:text-[2.3rem]">¡Tu compra tiene premio!</h2>
          <p className="mt-4 text-sm leading-6 text-[#5c6553]">En compras superiores a <strong className="block text-[1.6rem] font-semibold tracking-tight text-[#35432d]">{formatCartMoney(promotion.minimumCents)}</strong></p>

          <div className="mt-6 flex items-center justify-between gap-2 rounded-2xl border border-[#d6dccb] bg-white/65 px-4 py-3">
            <div className="min-w-0">
              <p className="mb-1 text-[10px] font-semibold tracking-[0.12em] uppercase text-[#69725f]">Tu cupón</p>
              <span className="select-all font-mono text-[1.1rem] font-semibold tracking-[0.04em] text-[#35432d]">{promotion.code}</span>
            </div>
            <button type="button" onClick={copyCode} aria-label="Copiar código" title="Copiar código" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e9edde] text-[#455638] transition hover:bg-[#d9e1cb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="8" width="12" height="13" rx="2" /><path d="M15 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" /></svg>
            </button>
          </div>
          <p role="status" className="mt-2 min-h-5 text-xs text-[#455638]">{copyMessage}</p>
          <button type="button" onClick={() => { applyCoupon(promotion.code); dismiss(); openCart(); }}
            className="mt-2 flex w-full items-center justify-between gap-3 rounded-2xl bg-[#455638] px-5 py-4 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(69,86,56,0.16)] transition hover:bg-[#35432d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive">
            Aplicar al carrito
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16m-6-6 6 6-6 6" /></svg>
          </button>
          <p id="promotion-conditions" className="mt-5 border-t border-[#e2e2d5] pt-4 text-xs leading-[1.6] text-[#626a59]">{promotionConditions(promotion)}</p>
        </div>
      </div>
    </dialog>
  );
}
