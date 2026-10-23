"use client";

import { useRef, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { couponMessage, formatCartMoney, pesosToExceedMinimum, promotionConditions, promotionDeadline, promotionStatus } from "@/lib/promotions";

export function CartCoupon() {
  const { couponCode, quote, promotion, now, applyCoupon, removeCoupon } = useCart();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [showConditions, setShowConditions] = useState(false);
  const entryToggleRef = useRef<HTMLButtonElement>(null);
  const active = promotionStatus(promotion, now) === "applied";
  const remaining = pesosToExceedMinimum(quote.subtotalCents, promotion);
  const applied = quote.status === "applied";

  return (
    <section aria-label="Cupón de descuento" className="rounded-2xl border border-[#dce3cf] bg-[#eff3e7] px-3.5 py-3 text-[#35432d]">
      {active && !applied ? (
        <div className="mb-2.5">
          {remaining > 0 ? (
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 text-xs leading-5">Te {remaining === 1 ? "falta" : "faltan"} <strong className="text-sm font-semibold tabular-nums">{formatCartMoney(remaining * 100)}</strong> para superar los {formatCartMoney(promotion.minimumCents)}.</p>
              <span className="shrink-0 rounded-md bg-[#455638] px-2 py-1 text-[10px] font-bold text-white">{promotion.percent}% OFF</span>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <p className="text-xs font-medium">¡Tu {promotion.percent}% OFF está listo!</p>
              <button type="button" onClick={() => { applyCoupon(promotion.code); setError(""); entryToggleRef.current?.focus(); }} className="rounded py-1 text-xs font-semibold underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-olive">Aplicá {promotion.code}</button>
            </div>
          )}
          <progress aria-label="Progreso para acceder al descuento" max={promotion.minimumCents + 100}
            value={Math.min(quote.subtotalCents, promotion.minimumCents + 100)} className="mt-2 block h-2 w-full appearance-none overflow-hidden rounded-full bg-white accent-olive [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-white [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-[linear-gradient(90deg,#7b934c,#536d31)] [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-[linear-gradient(90deg,#7b934c,#536d31)]" />
        </div>
      ) : null}
      <div id="coupon-feedback" role="status" aria-live="polite" className="text-xs leading-5 text-[#53633e]">
        {error ? <p className="mb-2 text-[#934936]">{error}</p> : null}
        {couponCode ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <p className="flex flex-wrap items-center gap-x-2">
                <strong className="font-mono text-[11px] tracking-wide">{couponCode}</strong>
                {applied || quote.status === "minimum" ? <span className="text-[10px] text-[#657252]">{applied ? `${promotion.percent}% OFF aplicado` : "Guardado"}</span> : null}
              </p>
              <button type="button" onClick={() => { removeCoupon(); setError(""); entryToggleRef.current?.focus(); }} className="rounded py-1 text-[11px] text-[#727c63] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-olive">Quitar cupón</button>
            </div>
            {!applied && quote.status !== "minimum" ? <p className="mt-1 text-[11px]">{couponMessage(quote.status, promotion)}</p> : null}
          </>
        ) : null}
      </div>
      <div id="coupon-entry" hidden={!editing}>
        {editing ? (
          <form className="mt-2.5" onSubmit={(event) => {
            event.preventDefault();
            const result = applyCoupon(draft);
            const valid = result.status === "applied" || result.status === "minimum";
            setError(result.status === "none" ? "Ingresá un código de descuento." : valid ? "" : couponMessage(result.status, promotion));
            if (valid) { setDraft(""); setEditing(false); entryToggleRef.current?.focus(); }
          }}>
            <label htmlFor="cart-coupon" className="sr-only">Código de descuento</label>
            <div className="flex gap-2">
              <input id="cart-coupon" value={draft} maxLength={40} onChange={(event) => { setDraft(event.target.value); setError(""); }}
                autoFocus autoCapitalize="characters" autoComplete="off" spellCheck={false} aria-describedby="coupon-feedback"
                aria-invalid={Boolean(error)} placeholder="Ingresá tu código"
                className="min-w-0 flex-1 rounded-xl border border-[#d5ddc8] bg-white px-3 py-2 text-base uppercase text-[#35432d] placeholder:normal-case placeholder:text-[#939c85] focus-visible:outline-2 focus-visible:outline-olive" />
              <button type="submit" className="shrink-0 rounded-xl border border-[#b4c19e] bg-white px-3 py-2 text-xs font-semibold text-[#455638] hover:bg-[#e5ecd9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive">Aplicar</button>
            </div>
          </form>
        ) : null}
      </div>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 text-[10px] text-[#727c63]">
        <button id="coupon-entry-toggle" ref={entryToggleRef} type="button" aria-expanded={editing} aria-controls="coupon-entry" onClick={() => { setEditing((current) => !current); setError(""); }} className="rounded py-1 text-left underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-olive">
          {editing ? "Ocultar campo" : couponCode ? "Editar cupón" : "¿Tenés un cupón de descuento?"}
        </button>
        {active ? <button type="button" aria-expanded={showConditions} aria-controls="coupon-conditions" onClick={() => setShowConditions((current) => !current)} className="rounded py-1 text-left underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-olive">Hasta el {promotionDeadline(promotion)} · Condiciones</button> : null}
      </div>
      <div id="coupon-conditions" hidden={!active || !showConditions}>
        <p className="mt-2 border-t border-[#d8e0cc] pt-2 text-[10px] leading-4 text-[#727c63]">{promotionConditions(promotion)}</p>
      </div>
    </section>
  );
}
