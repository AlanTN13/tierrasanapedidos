"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CartDrawer } from "@/components/cart-drawer";
import { CartProvider, useCart } from "@/components/cart-provider";
import { FloatingWhatsAppButton } from "@/components/floating-whatsapp-button";
import { Header } from "@/components/header";
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
    <div className="min-h-screen bg-[#fffdf9] pb-24">
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
          className="container-shell py-6 sm:py-9 lg:py-12"
        >
          <div className="mx-auto max-w-7xl">
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 text-sm font-semibold text-olive-dark hover:text-olive focus:outline-none focus-visible:ring-2 focus-visible:ring-olive/30"
            >
              <span aria-hidden="true">←</span>
              {backLabel}
            </Link>

            <div className="mt-5 border-b border-olive/12 pb-5 sm:mt-7 sm:pb-7">
              <h1
                id="category-title"
                className="font-display text-[2.35rem] leading-[1] font-semibold text-olive-dark sm:text-5xl"
              >
                {title}
              </h1>
              <p className="mt-2 text-sm font-medium text-foreground/58 sm:text-base">
                {products.length} {products.length === 1 ? "producto" : "productos"}
              </p>
            </div>

            {products.length > 0 ? (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-7 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
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
    <article className="flex min-w-0 flex-col overflow-hidden rounded-[1.2rem] bg-white shadow-[0_8px_24px_rgba(47,51,40,0.09)] ring-1 ring-olive/8">
      <Link
        href={`/producto/${product.id}`}
        aria-label={`Ver ${product.nombre}`}
        className="group relative aspect-square overflow-hidden bg-[#f7f4eb] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-olive"
      >
        <Image
          src={product.imagen}
          alt={product.nombre}
          fill
          sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 20vw"
          className="object-cover transition duration-300 group-hover:scale-[1.025]"
        />
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <Link
          href={`/producto/${product.id}`}
          className="line-clamp-2 min-h-10 text-sm leading-5 font-semibold text-olive-dark hover:text-olive focus:outline-none focus-visible:underline sm:text-base"
        >
          {product.nombre}
        </Link>

        {product.presentaciones.length > 1 ? (
          <label className="mt-2 block">
            <span className="sr-only">Presentación de {product.nombre}</span>
            <select
              value={selectedPresentation.etiqueta}
              onChange={(event) => setSelectedLabel(event.target.value)}
              className="w-full rounded-[0.8rem] border border-olive/12 bg-[#fffdf9] px-2.5 py-2 text-[11px] font-medium text-olive-dark outline-none focus:border-olive/30 focus:ring-2 focus:ring-olive/20 sm:text-xs"
            >
              {product.presentaciones.map((presentation) => (
                <option key={presentation.etiqueta} value={presentation.etiqueta}>
                  {presentation.etiqueta}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="mt-2 text-[11px] text-foreground/58 sm:text-xs">
            {selectedPresentation.etiqueta}
          </p>
        )}

        <p className="mt-2 text-base font-semibold text-olive-dark sm:text-lg">
          {formatARS(selectedPresentation.precio)}
        </p>
        <button
          type="button"
          onClick={() => {
            onAdd(product, selectedPresentation);
            setJustAdded(true);
          }}
          className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-full bg-olive px-3 py-2 text-xs font-semibold text-white hover:bg-olive-dark focus:outline-none focus:ring-2 focus:ring-olive/35 sm:text-sm"
          aria-label={`Agregar ${product.nombre}, ${selectedPresentation.etiqueta}`}
        >
          {justAdded ? "Agregado" : "Agregar +"}
        </button>
      </div>
    </article>
  );
}
