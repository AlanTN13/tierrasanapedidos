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
    <section aria-label="Cupón de descuento">
      <div className="overflow-hidden rounded-[1.35rem] border border-[#dce3cf] bg-[#eff3e7] p-4 sm:p-5">
        {active ? (
          <div className="mb-4 border-b border-[#d8e0cc] pb-4 text-[#35432d]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[10px] font-semibold tracking-[0.12em] text-[#657252] uppercase">Tu compra tiene premio</p>
              <span className="shrink-0 rounded-lg bg-[#455638] px-2.5 py-1.5 text-xs font-bold tracking-wide text-white">{promotion.percent}% OFF</span>
            </div>
            {remaining > 0 ? (
              <>
                <p className="text-base leading-7">Te {remaining === 1 ? "falta" : "faltan"} <strong className="text-[1.6rem] font-semibold tracking-tight tabular-nums">{formatCartMoney(remaining * 100)}</strong></p>
                <p className="mt-1 text-xs leading-5 text-[#657252]">para superar los {formatCartMoney(promotion.minimumCents)} y acceder al descuento.</p>
              </>
            ) : quote.status === "applied" ? (
              <>
                <p className="text-xs text-[#657252]">Tu carrito ya tiene el {promotion.percent}% OFF.</p>
                <p className="mt-1 text-[1.6rem] font-semibold leading-8 tracking-tight tabular-nums">Ahorrás {formatCartMoney(quote.discountCents)}</p>
              </>
            ) : (
              <>
                <p className="font-display text-[1.4rem] leading-7">¡Tu descuento está listo!</p>
                <button type="button" onClick={() => { applyCoupon(promotion.code); setError(""); }} className="mt-1 rounded px-0.5 py-1 text-sm font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-olive">Aplicá {promotion.code}</button>
              </>
            )}
            <progress aria-label="Progreso para acceder al descuento" max={promotion.minimumCents + 100}
              value={Math.min(quote.subtotalCents, promotion.minimumCents + 100)} className="mt-3 block h-3.5 w-full appearance-none overflow-hidden rounded-full bg-white accent-olive [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-white [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-[linear-gradient(90deg,#7b934c,#536d31)] [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-[linear-gradient(90deg,#7b934c,#536d31)]" />
            <div className="mt-2 flex flex-wrap justify-between gap-x-3 gap-y-1 text-[10px] leading-4 text-[#657252]">
              <span>Llevás {formatCartMoney(quote.subtotalCents)}</span>
              <span>Más de {formatCartMoney(promotion.minimumCents)}</span>
            </div>
          </div>
        ) : null}
        <form onSubmit={(event) => {
          event.preventDefault();
          const result = applyCoupon(draft);
          setError(result.status === "none" ? "Ingresá un código de descuento." :
            result.status === "applied" || result.status === "minimum" ? "" : couponMessage(result.status, promotion));
          if (result.status === "applied" || result.status === "minimum") setDraft("");
        }}>
          <label htmlFor="cart-coupon" className="block text-xs font-medium text-[#53633e]">¿Tenés un cupón de descuento?</label>
          <div className="mt-2 flex gap-2">
            <input id="cart-coupon" value={draft} maxLength={40} onChange={(event) => { setDraft(event.target.value); setError(""); }}
              autoCapitalize="characters" autoComplete="off" spellCheck={false} aria-describedby="coupon-feedback"
              aria-invalid={Boolean(error)} placeholder="Ingresá tu código"
              className="min-w-0 flex-1 rounded-xl border border-[#d5ddc8] bg-white px-3 py-2.5 text-base uppercase text-[#35432d] placeholder:normal-case placeholder:text-[#939c85] focus-visible:outline-2 focus-visible:outline-olive" />
            <button type="submit" className="shrink-0 rounded-xl border border-[#b4c19e] bg-white px-3 py-2 text-xs font-semibold text-[#455638] hover:bg-[#e5ecd9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive">Aplicar</button>
          </div>
        </form>
        <div id="coupon-feedback" role="status" aria-live="polite" className="text-xs leading-5 text-[#53633e]">
          {error ? <p className="mt-2 text-[#934936]">{error}</p> : null}
          {couponCode ? (
            <div className="mt-3 rounded-xl bg-white/70 px-3 py-2.5">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <strong className="font-mono text-xs tracking-wide text-[#455638]">{couponCode}</strong>
                <button type="button" onClick={() => { removeCoupon(); setError(""); }} className="rounded px-0.5 py-1 text-[11px] text-[#727c63] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-olive">Quitar cupón</button>
              </div>
              <p className="mt-0.5 text-[11px] leading-4">{quote.status === "minimum" ? `Guardado. Tu compra debe superar ${formatCartMoney(promotion.minimumCents)}.` : couponMessage(quote.status, promotion)}</p>
            </div>
          ) : null}
        </div>
      </div>
      {active ? <p className="mt-3 px-1 text-[10px] leading-4 text-[#7c8272]">{promotionConditions(promotion)}</p> : null}
    </section>
  );
}
