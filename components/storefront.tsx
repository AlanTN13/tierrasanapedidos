"use client";

import { useEffect, useState } from "react";
import { CartProvider, useCart } from "@/components/cart-provider";
import { CartDrawer } from "@/components/cart-drawer";
import { CategoryFilters } from "@/components/category-filters";
import { FloatingCartButton } from "@/components/floating-cart-button";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { ProductCard } from "@/components/product-card";
import { filterProducts, getCategories } from "@/lib/catalog";
import type { FilterCategory, Product } from "@/types/catalog";

type StorefrontProps = {
  products: Product[];
};

export function Storefront({ products }: StorefrontProps) {
  return (
    <CartProvider>
      <StorefrontContent products={products} />
    </CartProvider>
  );
}

function StorefrontContent({ products }: StorefrontProps) {
  const availableCategories = getCategories(products);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("Todos");
  const [isShippingOpen, setIsShippingOpen] = useState(false);
  const [recentlyAddedLabel, setRecentlyAddedLabel] = useState<string | null>(null);
  const visibleProducts = filterProducts(products, activeCategory, "");
  const activeCategoryLabel =
    activeCategory === "Todos" ? "Todas las categorias" : activeCategory;

  const {
    items,
    isOpen,
    totalItems,
    subtotal,
    openCart,
    closeCart,
    clearCart,
    addItem,
    removeItem,
    updateQuantity,
  } = useCart();

  useEffect(() => {
    if (!recentlyAddedLabel) {
      return;
    }

    const timeoutId = window.setTimeout(() => setRecentlyAddedLabel(null), 2800);

    return () => window.clearTimeout(timeoutId);
  }, [recentlyAddedLabel]);

  useEffect(() => {
    if (!isShippingOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsShippingOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isShippingOpen]);

  function handleCategoryChange(category: FilterCategory) {
    setActiveCategory(category);

    requestAnimationFrame(() => {
      document.getElementById("productos")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function handleAddItem(
    product: Product,
    presentation: Product["presentaciones"][number],
    quantity: number,
  ) {
    addItem(product, presentation, quantity);
    setRecentlyAddedLabel(
      `${quantity} x ${product.nombre} · ${presentation.etiqueta}`,
    );
  }

  return (
    <div className="pb-28">
      <Header
        categories={availableCategories}
        activeCategory={activeCategory}
        onChangeCategory={handleCategoryChange}
        onOpenShipping={() => setIsShippingOpen(true)}
        totalItems={totalItems}
        onOpenCart={openCart}
      />
      <main>
        <Hero />

        <section id="productos" className="container-shell pb-12">
          <div className="surface-panel organic-outline rounded-[2rem] px-5 py-6 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="section-kicker">Categorias</span>
                <h2 className="mt-3 font-display text-3xl font-semibold text-olive-dark sm:text-4xl">
                  Explora el catalogo por categoria
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-foreground/64">
                Selecciona una familia de productos y te mostramos solo lo que
                corresponde a esa seccion.
              </p>
            </div>

            <div className="mt-6">
              <CategoryFilters
                categories={availableCategories}
                activeCategory={activeCategory}
                onChange={handleCategoryChange}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="section-kicker">Catalogo</span>
              <h2 className="mt-3 font-display text-3xl font-semibold text-olive-dark sm:text-4xl">
                {activeCategoryLabel}
              </h2>
            </div>
            <p className="text-sm leading-6 text-foreground/62">
              {visibleProducts.length} productos disponibles con el filtro actual.
            </p>
          </div>

          {visibleProducts.length > 0 ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={handleAddItem}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[1.8rem] border border-dashed border-olive/18 bg-white/72 p-8 text-center">
              <p className="text-lg font-semibold text-olive-dark">
                No encontramos productos para esa categoria.
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground/62">
                Prueba con otro filtro para seguir armando tu pedido.
              </p>
            </div>
          )}
        </section>

        <section className="container-shell pb-10">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="surface-panel organic-outline rounded-[2rem] px-5 py-6 sm:px-6">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-olive-soft text-xl text-olive-dark">
                🛒
              </div>
              <span className="section-kicker mt-4">Pedido asistido</span>
              <p className="mt-3 max-w-md text-sm leading-6 text-foreground/68">
                Revisa tu carrito antes de enviar el pedido y confirmamos stock,
                precios y retiro por WhatsApp.
              </p>
              <button
                type="button"
                onClick={openCart}
                className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-olive-dark shadow-[0_12px_26px_rgba(111,127,79,0.08)] hover:bg-olive-soft/45 focus:outline-none focus:ring-2 focus:ring-olive/35 sm:w-auto"
              >
                Revisar carrito
              </button>
            </div>

            <div className="organic-outline rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.9)_0%,rgba(254,244,247,0.96)_30%,rgba(243,239,255,0.96)_100%)] px-5 py-6 sm:px-6">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[linear-gradient(135deg,#fdf497_0%,#fd5949_38%,#d6249f_68%,#285AEB_100%)] text-white shadow-[0_12px_26px_rgba(214,36,159,0.18)]">
                <InstagramMiniIcon />
              </div>
              <span className="section-kicker mt-4">Instagram</span>
              <p className="mt-3 max-w-md text-sm leading-6 text-foreground/68">
                Seguinos para ver ingresos, novedades y un poco del día a día de
                Tierra Sana.
              </p>
              <a
                href="https://www.instagram.com/tierrasana.dietetica/"
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#fd5949_0%,#d6249f_58%,#285AEB_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(214,36,159,0.2)] hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-[#d6249f]/30 sm:w-auto"
              >
                Ir a @tierrasana.dietetica
              </a>
            </div>
          </div>
        </section>
      </main>

      <FloatingCartButton
        totalItems={totalItems}
        subtotal={subtotal}
        onOpenCart={openCart}
      />

      <CartDrawer
        items={items}
        isOpen={isOpen}
        subtotal={subtotal}
        onClose={closeCart}
        onCheckout={clearCart}
        onRemove={removeItem}
        onUpdateQuantity={updateQuantity}
      />

      <div
        className={`fixed inset-0 z-[60] transition lg:hidden ${
          isShippingOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!isShippingOpen}
      >
        <button
          type="button"
          onClick={() => setIsShippingOpen(false)}
          className={`absolute inset-0 bg-[#2f3328]/22 backdrop-blur-[2px] transition-opacity ${
            isShippingOpen ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Cerrar informacion de entregas"
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="shipping-title"
          className={`absolute right-0 bottom-0 left-0 rounded-t-[2rem] bg-[#fffdf9] p-5 shadow-[0_-24px_60px_rgba(63,74,47,0.18)] transition-transform duration-300 ${
            isShippingOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-olive/16" />
          <div className="flex items-start gap-4">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.1rem] bg-olive-soft text-2xl">
              📦
            </span>
            <div>
              <p
                id="shipping-title"
                className="text-sm font-bold tracking-[0.12em] text-earth uppercase"
              >
                Entregas en la zona sin costo
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground/68">
                Realizamos entregas en Avellaneda, Sarandi, Villa Dominico,
                Gerli, Bernal y Don Bosco.
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground/68">
                El dia y horario se coordina por WhatsApp.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsShippingOpen(false)}
            className="mt-5 w-full rounded-full bg-olive px-5 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-olive/35"
          >
            Entendido
          </button>
        </div>
      </div>

      <div
        className={`fixed right-4 bottom-24 z-40 w-[min(92vw,26rem)] transition-all duration-300 sm:right-6 sm:bottom-28 ${
          recentlyAddedLabel
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
        aria-live="polite"
      >
        <div className="organic-outline card-shadow rounded-[1.6rem] bg-[#fffdf9]/96 p-4 backdrop-blur">
          <p className="text-sm font-semibold text-olive-dark">
            Producto agregado al carrito
          </p>
          <p className="mt-1 text-sm leading-6 text-foreground/66">
            {recentlyAddedLabel}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setRecentlyAddedLabel(null);
                openCart();
              }}
              className="rounded-full bg-olive px-4 py-2 text-sm font-semibold text-white hover:bg-olive-dark focus:outline-none focus:ring-2 focus:ring-olive/35"
            >
              Ver carrito
            </button>
            <button
              type="button"
              onClick={() => setRecentlyAddedLabel(null)}
              className="rounded-full px-4 py-2 text-sm font-semibold text-olive-dark hover:bg-olive-soft/55 focus:outline-none focus:ring-2 focus:ring-olive/25"
            >
              Seguir comprando
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InstagramMiniIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.75" />
      <circle cx="17.25" cy="6.75" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
