"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { couponMessage, formatCartMoney, pesosToExceedMinimum, promotionConditions, promotionStatus } from "@/lib/promotions";

export function CartCoupon() {
  const { couponCode, quote, promotion, now, applyCoupon, removeCoupon } = useCart();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const active = promotionStatus(promotion, now) === "applied";
  const remaining = pesosToExceedMinimum(quote.subtotalCents, promotion);

  return (
    <section aria-label="Cupón de descuento" className="rounded-2xl border border-olive/15 bg-olive-soft/20 p-4">
      <form onSubmit={(event) => {
        event.preventDefault();
        const result = applyCoupon(draft);
        setError(result.status === "none" ? "Ingresá un código de descuento." :
          result.status === "applied" || result.status === "minimum" ? "" : couponMessage(result.status, promotion));
        if (result.status === "applied" || result.status === "minimum") setDraft("");
      }}>
        <label htmlFor="cart-coupon" className="block text-sm font-semibold text-olive-dark">¿Tenés un cupón de descuento?</label>
        <div className="mt-3 flex gap-2">
          <input id="cart-coupon" value={draft} maxLength={40} onChange={(event) => { setDraft(event.target.value); setError(""); }}
            autoCapitalize="characters" autoComplete="off" spellCheck={false} aria-describedby="coupon-feedback"
            aria-invalid={Boolean(error)} placeholder="Ingresá tu código"
            className="min-w-0 flex-1 rounded-xl border border-olive/25 bg-white px-3 py-2.5 text-base uppercase text-olive-dark focus-visible:outline-2 focus-visible:outline-olive" />
          <button type="submit" className="shrink-0 rounded-xl bg-olive px-3 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive">Aplicar</button>
        </div>
      </form>
      <div id="coupon-feedback" role="status" aria-live="polite" className="mt-2 text-sm leading-5 text-olive-dark">
        {error ? <p>{error}</p> : null}
        {couponCode ? (
          <>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <strong>{couponCode}</strong>
              <button type="button" onClick={() => { removeCoupon(); setError(""); }} className="rounded-full px-2 py-1 underline focus-visible:outline-2 focus-visible:outline-olive">Quitar cupón</button>
            </div>
            <p>{couponMessage(quote.status, promotion)}</p>
          </>
        ) : null}
      </div>
      {active ? (
        <div className="mt-4 text-sm leading-5 text-olive-dark">
          <div className="rounded-2xl border border-[#b7c69f] bg-gradient-to-br from-[#e7eed9] to-[#f5f8ee] p-4 shadow-[0_4px_14px_rgba(63,74,47,0.07)]">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#455638] px-2.5 py-1 text-xs font-bold tracking-wide text-white">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><path d="M3 8h18v4H3zM5 12v9h14v-9M12 8v13" /><path d="M12 8H8.5a2.5 2.5 0 1 1 2.4-3.2L12 8Zm0 0h3.5a2.5 2.5 0 1 0-2.4-3.2L12 8Z" /></svg>
                {promotion.percent}% OFF
              </span>
              <span className="text-xs font-medium text-[#53633e]">{remaining > 0 ? "¡Estás cada vez más cerca!" : "¡Objetivo cumplido!"}</span>
            </div>
            {remaining > 0 ? (
              <>
                <p className="text-base leading-7">Te {remaining === 1 ? "falta" : "faltan"} <strong className="text-2xl font-bold tracking-tight text-[#35432d]">{formatCartMoney(remaining * 100)}</strong></p>
                <p className="mt-1 text-sm leading-5 text-[#53633e]">para superar los {formatCartMoney(promotion.minimumCents)} y acceder al descuento.</p>
              </>
            ) : quote.status === "applied" ? <p className="text-base font-semibold leading-6">Tu carrito ya tiene el {promotion.percent}% OFF.</p> :
              <p className="text-sm leading-6">¡Tu carrito ya cumple las condiciones del {promotion.percent}% OFF! <button type="button" onClick={() => { applyCoupon(promotion.code); setError(""); }} className="font-bold underline decoration-2 underline-offset-2 focus-visible:outline-2 focus-visible:outline-olive">Aplicá {promotion.code}</button>.</p>}
            <progress aria-label="Progreso para acceder al descuento" max={promotion.minimumCents + 100}
              value={Math.min(quote.subtotalCents, promotion.minimumCents + 100)} className="mt-4 block h-3.5 w-full appearance-none overflow-hidden rounded-full border border-[#c4d0b3] bg-white accent-olive [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-white [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-[linear-gradient(90deg,#8ba65b,#536d31)] [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-[linear-gradient(90deg,#8ba65b,#536d31)]" />
            <div className="mt-2 flex flex-wrap justify-between gap-x-3 gap-y-1 text-[11px] font-medium leading-4 text-[#53633e]">
              <span>Tu carrito: {formatCartMoney(quote.subtotalCents)}</span>
              <span>Más de {formatCartMoney(promotion.minimumCents)}</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-foreground/70">{promotionConditions(promotion)}</p>
        </div>
      ) : null}
    </section>
  );
}
