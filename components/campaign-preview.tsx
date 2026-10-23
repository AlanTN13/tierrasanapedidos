"use client";

import Link from "next/link";
import { CartProvider, useCart } from "@/components/cart-provider";
import { CartDrawer } from "@/components/cart-drawer";
import { NOVEMBER_PROMOTION, formatCartMoney } from "@/lib/promotions";
import type { Product } from "@/types/catalog";

const previewPromotion = { ...NOVEMBER_PROMOTION, commercialApproved: true };
const previewNow = Date.parse("2026-11-15T12:00:00-03:00");
const TEST_PRICES = [19000, 20000, 20001, 25000, 40000];

export function CampaignPreview() {
  return <CartProvider promotion={previewPromotion} previewNow={previewNow}><PreviewContent /></CartProvider>;
}

function PreviewContent() {
  const cart = useCart();
  return (
    <main id="main-content" className="min-h-screen bg-[#fffdf9] p-5 text-olive-dark sm:p-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-widest text-earth">Preview · sin pedidos reales</p>
        <h1 className="mt-4 text-3xl font-semibold">Noviembre Tierra Sana</h1>
        <p className="mt-4 leading-7">Reloj simulado: 15/11/2026, Argentina. Aprobación comercial simulada sólo en esta ruta de preview. Los productos de abajo son fixtures para probar los límites, no precios del catálogo.</p>
        <p className="mt-3 leading-7">El pop-up aparece después de 1 segundo si no hay otro diálogo abierto. Al cerrar, no vuelve durante esta sesión.</p>
        <button type="button" onClick={cart.openCart} className="my-5 rounded-full bg-olive px-5 py-3 font-semibold text-white">Ver carrito ({cart.totalItems})</button>
        <div className="grid gap-3 sm:grid-cols-2">
          {TEST_PRICES.map((price) => <button key={price} type="button" onClick={() => {
            const product: Product = {
              id: `preview-${price}`, nombre: `Producto de prueba ${price}`, categoria: "Prueba",
              descripcion: "Fixture, no pertenece al catálogo", imagen: "/productos/placeholder.svg", destacado: false,
              presentaciones: [{ etiqueta: "unidad", precio: price, measurementKind: "unit", amountValue: 1, amountUnit: "unit", amountInBaseUnits: 1 }],
            };
            cart.clearCart(); cart.addItem(product, product.presentaciones[0], 1); cart.openCart();
          }} className="rounded-2xl border border-olive/25 bg-white p-5 text-left font-semibold hover:bg-olive-soft">Probar carrito de {formatCartMoney(price * 100)}</button>)}
        </div>
        <p className="mt-6"><Link href="/catalogo" className="underline">Continuar al catálogo</Link> · Al salir de esta preview vuelve la configuración pública, que mantiene el gate económico.</p>
      </div>
      <CartDrawer items={cart.items} isOpen={cart.isOpen} subtotal={cart.subtotal} onClose={cart.closeCart}
        onCheckout={cart.clearCart} onRemove={cart.removeItem} onUpdateQuantity={cart.updateQuantity} />
    </main>
  );
}
