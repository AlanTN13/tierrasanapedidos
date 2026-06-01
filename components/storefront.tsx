"use client";

import { startTransition, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CartProvider, useCart } from "@/components/cart-provider";
import { CartDrawer } from "@/components/cart-drawer";
import { FloatingCartButton } from "@/components/floating-cart-button";
import { Header } from "@/components/header";
import { HomeDiscovery } from "@/components/home-discovery";
import { Hero } from "@/components/hero";
import { ProductCard } from "@/components/product-card";
import {
  filterProducts,
  getCategories,
  normalizeSearchText,
} from "@/lib/catalog";
import { getHomeContent } from "@/lib/home";
import type { FilterCategory, Product } from "@/types/catalog";

type StorefrontProps = {
  products: Product[];
  initialSearchQuery?: string;
};

export function Storefront({ products, initialSearchQuery = "" }: StorefrontProps) {
  return (
    <CartProvider>
      <StorefrontContent
        key={initialSearchQuery}
        products={products}
        initialSearchQuery={initialSearchQuery}
      />
    </CartProvider>
  );
}

function StorefrontContent({ products, initialSearchQuery = "" }: StorefrontProps) {
  const router = useRouter();
  const pathname = usePathname();
  const availableCategories = getCategories(products);
  const homeContent = getHomeContent(products);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("Destacados");
  const [draftSearchQuery, setDraftSearchQuery] = useState(initialSearchQuery);
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState(initialSearchQuery);
  const [isShippingOpen, setIsShippingOpen] = useState(false);
  const [recentlyAddedLabel, setRecentlyAddedLabel] = useState<string | null>(null);
  const normalizedSearchQuery = normalizeSearchText(submittedSearchQuery);
  const visibleSectionLinks = normalizedSearchQuery
    ? [{ id: "productos", label: "Resultados" }]
    : homeContent.sectionLinks;
  const visibleProducts = filterProducts(products, activeCategory, submittedSearchQuery);
  const activeCategoryLabel = normalizedSearchQuery
    ? `Resultados para ${submittedSearchQuery.trim()}`
    : activeCategory;
  const isFeaturedView = !normalizedSearchQuery && activeCategory === "Destacados";

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
    setDraftSearchQuery("");
    setSubmittedSearchQuery("");

    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });

    requestAnimationFrame(() => {
      document.getElementById("productos")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function submitSearch(nextRawQuery: string) {
    const nextQuery = nextRawQuery.trim();
    const params = new URLSearchParams();

    if (nextQuery) {
      params.set("q", nextQuery);
    }

    setDraftSearchQuery(nextQuery);
    setSubmittedSearchQuery(nextQuery);

    startTransition(() => {
      router.replace(params.size > 0 ? `${pathname}?${params.toString()}` : pathname, {
        scroll: false,
      });
    });

    requestAnimationFrame(() => {
      document.getElementById("productos")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function handleSubmitSearch() {
    submitSearch(draftSearchQuery);
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
      <ShippingTicker onOpenShipping={() => setIsShippingOpen(true)} />
      <Header
        sectionLinks={visibleSectionLinks}
        categories={availableCategories}
        activeCategory={activeCategory}
        onChangeCategory={handleCategoryChange}
        searchQuery={draftSearchQuery}
        onSearchChange={setDraftSearchQuery}
        onSubmitSearch={handleSubmitSearch}
        onClearSearch={() => {
          setDraftSearchQuery("");
          setSubmittedSearchQuery("");
          startTransition(() => {
            router.replace(pathname, { scroll: false });
          });
        }}
        totalItems={totalItems}
        onOpenCart={openCart}
      />
      <main>
        {!normalizedSearchQuery ? (
          <Hero
            content={homeContent.hero}
            searchQuery={draftSearchQuery}
            onSearchChange={setDraftSearchQuery}
            onSubmitSearch={handleSubmitSearch}
            onClearSearch={() => {
              setDraftSearchQuery("");
              setSubmittedSearchQuery("");
              startTransition(() => {
                router.replace(pathname, { scroll: false });
              });
            }}
          />
        ) : null}
        {!normalizedSearchQuery ? (
          <HomeDiscovery
            content={homeContent}
            onSelectCategory={handleCategoryChange}
          />
        ) : null}

        <section id="productos" className="container-shell pb-12">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="section-kicker">Catalogo</span>
              <h2 className={`mt-3 font-display font-semibold text-olive-dark ${isFeaturedView ? "text-[2rem] sm:text-[2.4rem]" : "text-3xl sm:text-4xl"}`}>
                {isFeaturedView ? "Selección destacada" : activeCategoryLabel}
              </h2>
              {isFeaturedView ? (
                <p className="mt-2 max-w-xl text-[13px] leading-5 text-foreground/62 sm:text-sm sm:leading-6">
                  Una vidriera corta con algunos productos que representan mejor la tienda hoy, para entrar más rápido sin sentir que estás viendo otra categoría más.
                </p>
              ) : null}
            </div>
            <p className="text-sm leading-6 text-foreground/62">
              {visibleProducts.length} productos disponibles con el filtro actual.
            </p>
          </div>

          {visibleProducts.length > 0 ? (
            <div className={`mt-6 grid ${isFeaturedView ? "gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-5" : "gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"}`}>
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  hideFeaturedBadge={isFeaturedView}
                  compact={isFeaturedView}
                  onAdd={handleAddItem}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[1.8rem] border border-dashed border-olive/18 bg-white/72 p-8 text-center">
              <p className="text-lg font-semibold text-olive-dark">
                {normalizedSearchQuery
                  ? "No encontramos productos con esa busqueda."
                  : "No encontramos productos para esa categoria."}
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground/62">
                {normalizedSearchQuery
                  ? "Probá con otro nombre o categoría."
                  : "Prueba con otro filtro para seguir armando tu pedido."}
              </p>
            </div>
          )}
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
                Realizamos entregas en Avellaneda, Sarandi, Wilde, Villa
                Dominico, Gerli, Bernal y Don Bosco.
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

function ShippingTicker({ onOpenShipping }: { onOpenShipping: () => void }) {
  const shippingTickerText =
    "Entregas sin costo en Avellaneda, Sarandi, Wilde, Villa Dominico, Gerli, Bernal y Don Bosco";

  return (
    <div className="border-b border-olive/10 bg-olive">
      <button
        type="button"
        onClick={onOpenShipping}
        className="relative block w-full overflow-hidden py-1.5 text-left text-white focus:outline-none focus:ring-2 focus:ring-white/25"
        aria-label="Ver zonas y condiciones de entrega"
      >
        <div className="pointer-events-none flex min-w-max animate-[shipping-marquee_28s_linear_infinite] items-center gap-8 whitespace-nowrap pr-8">
          {[0, 1, 2].map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-8 text-[0.64rem] font-semibold tracking-[0.08em] uppercase sm:text-[0.68rem]"
            >
              <span className="inline-flex items-center gap-3">
                <span className="ml-3 sm:ml-4">{shippingTickerText}</span>
              </span>
            </span>
          ))}
        </div>
      </button>
    </div>
  );
}
