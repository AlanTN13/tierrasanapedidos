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
        <div className="mt-3 text-sm leading-5 text-olive-dark">
          {remaining > 0 ? <p>Te {remaining === 1 ? "falta" : "faltan"} {formatCartMoney(remaining * 100)} para superar los {formatCartMoney(promotion.minimumCents)} y acceder al descuento.</p> :
            quote.status === "applied" ? <p>Tu carrito ya tiene el {promotion.percent}% OFF.</p> :
              <p>¡Tu carrito ya cumple las condiciones del {promotion.percent}% OFF! <button type="button" onClick={() => { applyCoupon(promotion.code); setError(""); }} className="font-semibold underline focus-visible:outline-2 focus-visible:outline-olive">Aplicá {promotion.code}</button>.</p>}
          <progress aria-label="Progreso para acceder al descuento" max={promotion.minimumCents + 100}
            value={Math.min(quote.subtotalCents, promotion.minimumCents + 100)} className="mt-3 h-1.5 w-full accent-olive" />
          <p className="mt-2 text-xs text-foreground/70">{promotionConditions(promotion)}</p>
        </div>
      ) : null}
    </section>
  );
}
