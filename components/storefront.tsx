"use client";

import {
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { useRouter } from "next/navigation";
import { CartProvider, useCart } from "@/components/cart-provider";
import { CartDrawer } from "@/components/cart-drawer";
import { FloatingWhatsAppButton } from "@/components/floating-whatsapp-button";
import { FeaturedProducts } from "@/components/featured-products";
import { Header } from "@/components/header";
import { HomeCategories, HomeShorts } from "@/components/home-discovery";
import { Hero } from "@/components/hero";
import { purchaseRecipeIngredients } from "@/lib/recipe-cart";
import type { CatalogCategory, Product } from "@/types/catalog";
import type { HomeContent } from "@/types/home";

type StorefrontProps = {
  featuredProducts: Product[];
  categories: CatalogCategory[];
  homeContent: HomeContent;
};

export function Storefront({
  featuredProducts,
  categories,
  homeContent,
}: StorefrontProps) {
  return (
    <CartProvider>
      <StorefrontContent
        featuredProducts={featuredProducts}
        categories={categories}
        homeContent={homeContent}
      />
    </CartProvider>
  );
}

function StorefrontContent({
  featuredProducts,
  categories,
  homeContent,
}: StorefrontProps) {
  const router = useRouter();
  const [draftSearchQuery, setDraftSearchQuery] = useState("");
  const [isShippingOpen, setIsShippingOpen] = useState(false);
  const [recentlyAddedLabel, setRecentlyAddedLabel] = useState<string | null>(null);
  const [recipeCartFeedback, setRecipeCartFeedback] = useState<string | null>(null);

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
  const lastCartTriggerRef = useRef<HTMLElement | null>(null);
  const lastShippingTriggerRef = useRef<HTMLElement | null>(null);
  const shippingCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const shippingDialogRef = useRef<HTMLDivElement | null>(null);
  const previousCartOpenRef = useRef(isOpen);
  const previousShippingOpenRef = useRef(isShippingOpen);

  useEffect(() => {
    if (!recentlyAddedLabel) {
      return;
    }

    const timeoutId = window.setTimeout(() => setRecentlyAddedLabel(null), 2800);

    return () => window.clearTimeout(timeoutId);
  }, [recentlyAddedLabel]);

  useEffect(() => {
    if (!recipeCartFeedback) return;

    const timeoutId = window.setTimeout(() => setRecipeCartFeedback(null), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [recipeCartFeedback]);

  useEffect(() => {
    if (!isShippingOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsShippingOpen(false);
      }
      if (event.key === "Tab") {
        const controls = shippingDialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), [tabindex="0"]',
        );
        if (!controls?.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && (document.activeElement === first || !shippingDialogRef.current?.contains(document.activeElement))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !shippingDialogRef.current?.contains(document.activeElement))) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isShippingOpen]);

  useEffect(() => {
    if (isShippingOpen) {
      shippingCloseButtonRef.current?.focus();
    }
  }, [isShippingOpen]);

  useEffect(() => {
    if (previousCartOpenRef.current && !isOpen) {
      lastCartTriggerRef.current?.focus();
    }

    previousCartOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (previousShippingOpenRef.current && !isShippingOpen) {
      lastShippingTriggerRef.current?.focus();
    }

    previousShippingOpenRef.current = isShippingOpen;
  }, [isShippingOpen]);

  function rememberActiveElement(targetRef: MutableRefObject<HTMLElement | null>) {
    const activeElement = document.activeElement;

    targetRef.current = activeElement instanceof HTMLElement ? activeElement : null;
  }

  function handleOpenCart() {
    rememberActiveElement(lastCartTriggerRef);
    openCart();
  }

  function handleOpenShipping() {
    rememberActiveElement(lastShippingTriggerRef);
    setIsShippingOpen(true);
  }

  function handleSubmitSearch() {
    const query = draftSearchQuery.trim();

    if (!query) {
      return;
    }

    router.push(`/catalogo?q=${encodeURIComponent(query)}`);
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

  function handleBuyRecipeIngredients(
    recipe: HomeContent["recipeHighlights"][number],
  ) {
    const addedCount = purchaseRecipeIngredients(
      recipe.products,
      addItem,
      handleOpenCart,
    );

    if (addedCount > 0) {
      setRecipeCartFeedback(
        `${addedCount} producto${addedCount === 1 ? "" : "s"} agregado${addedCount === 1 ? "" : "s"} al carrito`,
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#fffdf9] pb-20">
      <ShippingTicker isOpen={isShippingOpen} onOpenShipping={handleOpenShipping} />
      <Header
        sectionLinks={[
          { id: "categorias", label: "Nuestras categorías" },
          { id: "destacados", label: "Los más elegidos" },
          { id: "ideas", label: "Mirá y descubrí" },
        ]}
        categories={categories}
        activeCategory={null}
        searchQuery={draftSearchQuery}
        onSearchChange={setDraftSearchQuery}
        onSubmitSearch={handleSubmitSearch}
        onClearSearch={() => {
          setDraftSearchQuery("");
        }}
        totalItems={totalItems}
        onOpenCart={handleOpenCart}
      />
      <main id="main-content">
        <Hero
          content={homeContent.hero}
          searchQuery={draftSearchQuery}
          onSearchChange={setDraftSearchQuery}
          onSubmitSearch={handleSubmitSearch}
          onClearSearch={() => setDraftSearchQuery("")}
        />
        <HomeCategories content={homeContent} />
        <FeaturedProducts products={featuredProducts} onAdd={handleAddItem} />
        <HomeShorts
          content={homeContent}
          onBuyIngredients={handleBuyRecipeIngredients}
        />
      </main>

      <FloatingWhatsAppButton />

      <CartDrawer
        items={items}
        isOpen={isOpen}
        subtotal={subtotal}
        onClose={closeCart}
        onCheckout={clearCart}
        onRemove={removeItem}
        onUpdateQuantity={updateQuantity}
      />

      {isShippingOpen ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center transition lg:items-center lg:p-6">
          <button
            type="button"
            onClick={() => setIsShippingOpen(false)}
            className="absolute inset-0 bg-[#2f3328]/22 backdrop-blur-[2px] transition-opacity opacity-100"
            aria-label="Cerrar informacion de entregas"
          />

          <div
            id="shipping-details"
            ref={shippingDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="shipping-title"
            className="relative max-h-[85dvh] w-full overflow-y-auto rounded-t-[2rem] bg-[#fffdf9] p-5 shadow-[0_-24px_60px_rgba(63,74,47,0.18)] transition-transform duration-300 translate-y-0 lg:max-w-lg lg:rounded-[2rem] lg:p-7"
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
              ref={shippingCloseButtonRef}
              className="mt-5 w-full rounded-full bg-olive px-5 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-olive/35"
            >
              Entendido
            </button>
          </div>
        </div>
      ) : null}

      {recentlyAddedLabel ? (
        <div
          className="fixed right-4 bottom-24 z-40 w-[min(92vw,26rem)] pointer-events-auto translate-y-0 opacity-100 transition-all duration-300 sm:right-6 sm:bottom-28"
          role="status"
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
                  handleOpenCart();
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
      ) : null}

      {recipeCartFeedback ? (
        <div
          className="fixed right-4 bottom-24 z-[80] w-[min(92vw,26rem)] sm:right-6 sm:bottom-28"
          role="status"
          aria-live="polite"
        >
          <div className="rounded-[1.4rem] bg-[#fffdf9]/98 px-4 py-3 text-sm font-semibold text-olive-dark shadow-[0_16px_40px_rgba(47,51,40,0.16)] ring-1 ring-olive/10 backdrop-blur">
            {recipeCartFeedback}
          </div>
        </div>
      ) : null}

    </div>
  );
}

function ShippingTicker({ isOpen, onOpenShipping }: { isOpen: boolean; onOpenShipping: () => void }) {
  return (
    <div className="border-b border-olive/10 bg-olive">
      <button
        type="button"
        onClick={onOpenShipping}
        className="group flex w-full flex-wrap items-center justify-center gap-x-2 gap-y-0.5 px-4 py-2 text-center text-xs font-medium text-white transition-colors hover:bg-olive-dark focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white"
        aria-label="Envíos y entregas: ver zonas y condiciones"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls="shipping-details"
      >
        <span>Envíos y entregas</span>
        <span aria-hidden="true">·</span>
        <span className="font-semibold underline decoration-white/60 underline-offset-4 group-hover:decoration-white">
          <span className="lg:hidden">Tocá para ver más</span>
          <span className="hidden lg:inline">Hacé clic para ver zonas y condiciones</span>
        </span>
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
