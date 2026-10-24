"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CartDrawer } from "@/components/cart-drawer";
import { CartProvider, useCart } from "@/components/cart-provider";
import { FloatingWhatsAppButton } from "@/components/floating-whatsapp-button";
import { Header } from "@/components/header";
import { StorefrontFooter } from "@/components/storefront-footer";
import { formatARS } from "@/lib/format";
import { getDefaultProductPresentation } from "@/lib/product-purchase";
import type {
  CatalogCategory,
  Product,
  ProductPresentation,
} from "@/types/catalog";

type CatalogListingStorefrontProps = {
  title: string;
  products: Product[];
  categories: CatalogCategory[];
  activeCategory: string | null;
  backHref: string;
  backLabel: string;
  initialSearchQuery?: string;
  emptyMessage?: string;
};

export function CatalogListingStorefront(props: CatalogListingStorefrontProps) {
  return (
    <CartProvider>
      <CatalogListingContent {...props} />
    </CartProvider>
  );
}

function CatalogListingContent({
  title,
  products,
  categories,
  activeCategory,
  backHref,
  backLabel,
  initialSearchQuery = "",
  emptyMessage = "No encontramos productos en esta categoría.",
}: CatalogListingStorefrontProps) {
  const router = useRouter();
  const cart = useCart();
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!feedback) return;

    const timeoutId = window.setTimeout(() => setFeedback(null), 2600);
    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  function submitSearch() {
    const query = searchQuery.trim();

    if (!query) return;
    router.push(`/catalogo?q=${encodeURIComponent(query)}`);
  }

  function addProduct(product: Product, presentation: ProductPresentation) {
    cart.addItem(product, presentation, 1);
    setFeedback(`${product.nombre} · ${presentation.etiqueta} agregado al carrito`);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fffdf9]">
      <Header
        sectionLinks={[{ id: "productos", label: title }]}
        categories={categories}
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSubmitSearch={submitSearch}
        onClearSearch={() => setSearchQuery("")}
        totalItems={cart.totalItems}
        onOpenCart={cart.openCart}
      />

      <main id="main-content">
        <section
          id="productos"
          aria-labelledby="category-title"
          className="container-shell scroll-mt-44 py-5 sm:py-8"
        >
          <div className="min-w-0">
            <Link
              href={backHref}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg text-sm font-medium text-olive-dark/75 hover:text-olive-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-olive/30"
            >
              <span aria-hidden="true">←</span>
              {backLabel}
            </Link>

            <div className="mt-2 flex flex-wrap items-end justify-between gap-3 border-b border-olive/15 pb-5 sm:mt-3 sm:pb-6">
              <h1
                id="category-title"
                className="min-w-0 font-display text-[2rem] leading-tight font-semibold break-words text-olive-dark sm:text-[2.5rem]"
              >
                {title}
              </h1>
              <p className="rounded-full bg-cream px-3 py-1.5 text-xs font-medium text-olive-dark/75 sm:text-sm">
                {products.length} {products.length === 1 ? "producto" : "productos"}
              </p>
            </div>

            {products.length > 0 ? (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
                {products.map((product) => (
                  <CategoryProductCard
                    key={product.id}
                    product={product}
                    onAdd={addProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-7 rounded-[1.5rem] border border-dashed border-olive/20 bg-white p-7 text-center">
                <p className="font-semibold text-olive-dark">{emptyMessage}</p>
                <Link
                  href="/"
                  className="mt-3 inline-flex text-sm font-semibold text-olive underline decoration-olive/30 underline-offset-4"
                >
                  Volver a Inicio
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <StorefrontFooter />

      <FloatingWhatsAppButton />
      <CartDrawer
        items={cart.items}
        isOpen={cart.isOpen}
        subtotal={cart.subtotal}
        onClose={cart.closeCart}
        onCheckout={cart.clearCart}
        onRemove={cart.removeItem}
        onUpdateQuantity={cart.updateQuantity}
      />

      {feedback ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 bottom-24 z-50 w-[min(92vw,24rem)] rounded-[1.3rem] bg-[#fffdf9]/98 px-4 py-3 text-sm font-semibold text-olive-dark shadow-[0_16px_40px_rgba(47,51,40,0.16)] ring-1 ring-olive/10 backdrop-blur sm:right-6 sm:bottom-28"
        >
          {feedback}
        </div>
      ) : null}
    </div>
  );
}

function CategoryProductCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (product: Product, presentation: ProductPresentation) => void;
}) {
  const defaultPresentation = getDefaultProductPresentation(product);
  const [selectedLabel, setSelectedLabel] = useState(
    defaultPresentation?.etiqueta ?? "",
  );
  const [justAdded, setJustAdded] = useState(false);
  const selectedPresentation =
    product.presentaciones.find(
      (presentation) => presentation.etiqueta === selectedLabel,
    ) ?? defaultPresentation;

  useEffect(() => {
    if (!justAdded) return;

    const timeoutId = window.setTimeout(() => setJustAdded(false), 1500);
    return () => window.clearTimeout(timeoutId);
  }, [justAdded]);

  if (!selectedPresentation) return null;

  return (
    <article className="relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-olive/20 bg-background shadow-[0_2px_8px_rgba(47,51,40,0.04)]">
      <Link
        href={`/producto/${product.id}`}
        aria-label={`Ver ${product.nombre}`}
        className="group relative aspect-[4/3] overflow-hidden border-b border-olive/10 bg-[#f7f4eb] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-olive"
      >
        <Image
          src={product.imagen}
          alt={product.nombre}
          fill
          sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, 17vw"
          className="object-contain transition duration-300 group-hover:scale-[1.025]"
        />
      </Link>

      <div className="flex flex-1 flex-col px-2.5 py-3 sm:px-3">
        <Link
          href={`/producto/${product.id}`}
          className="line-clamp-2 min-h-[36px] text-[13px] leading-[18px] font-semibold text-olive-dark hover:text-olive focus:outline-none focus-visible:underline sm:min-h-10 sm:text-[15px] sm:leading-5"
        >
          {product.nombre}
        </Link>
        {product.descripcion?.trim() ? (
          <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-foreground/70 sm:text-xs sm:leading-[18px]">
            {product.descripcion}
          </p>
        ) : null}

        {product.presentaciones.length > 1 ? (
          <label className="mt-auto block pt-3">
            <span className="sr-only">Presentación de {product.nombre}</span>
            <select
              value={selectedPresentation.etiqueta}
              onChange={(event) => setSelectedLabel(event.target.value)}
              className="min-h-[44px] w-full min-w-0 rounded-xl border border-olive/15 bg-[#fffdf9] px-2.5 py-2 text-base font-medium text-olive-dark outline-none focus:border-olive/40 focus:ring-2 focus:ring-olive/20 sm:text-sm"
            >
              {product.presentaciones.map((presentation) => (
                <option key={presentation.etiqueta} value={presentation.etiqueta}>
                  {presentation.etiqueta}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="mt-auto flex min-h-[44px] items-end pt-3 pb-2 text-xs text-foreground/65 sm:text-sm">
            {selectedPresentation.etiqueta}
          </p>
        )}
      </div>

      <div className="flex min-h-[58px] items-center justify-between gap-1 border-t border-olive/12 bg-cream/50 px-2.5 py-1.5 sm:px-3">
        <p className="min-w-0 text-[17px] leading-tight font-bold text-olive-dark tabular-nums [overflow-wrap:anywhere] sm:text-[18px]">
          {formatARS(selectedPresentation.precio)}
        </p>
        <button
          type="button"
          onClick={() => {
            onAdd(product, selectedPresentation);
            setJustAdded(true);
          }}
          className="group inline-flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-olive/50 focus-visible:ring-offset-1"
          aria-label={`Agregar ${product.nombre}, ${selectedPresentation.etiqueta}`}
        >
          <span className="inline-flex h-[36px] w-[36px] items-center justify-center rounded-full bg-olive text-white transition-colors group-hover:bg-olive-dark">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path d={justAdded ? "m5 12 4 4L19 6" : "M12 5v14M5 12h14"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      </div>
    </article>
  );
}
