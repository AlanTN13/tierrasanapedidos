"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CartDrawer } from "@/components/cart-drawer";
import { CartProvider, useCart } from "@/components/cart-provider";
import { FloatingWhatsAppButton } from "@/components/floating-whatsapp-button";
import { Header } from "@/components/header";
import { formatARS } from "@/lib/format";
import {
  createProductCartSelection,
  getDefaultProductPresentation,
  getProductPresentationByLabel,
} from "@/lib/product-purchase";
import type {
  CatalogCategory,
  Product,
} from "@/types/catalog";

export function ProductStorefront({
  product,
  categories,
}: {
  product: Product;
  categories: CatalogCategory[];
}) {
  return (
    <CartProvider>
      <ProductStorefrontContent product={product} categories={categories} />
    </CartProvider>
  );
}

function ProductStorefrontContent({
  product,
  categories,
}: {
  product: Product;
  categories: CatalogCategory[];
}) {
  const router = useRouter();
  const cart = useCart();
  const defaultPresentation = getDefaultProductPresentation(product);
  const [selectedPresentationLabel, setSelectedPresentationLabel] = useState(
    defaultPresentation?.etiqueta ?? "",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState("");
  const selectedPresentation = getProductPresentationByLabel(
    product,
    selectedPresentationLabel,
  );
  const primaryCategory =
    product.categorias?.[0] ?? product.categoria ?? categories[0]?.name ?? "Destacados";
  const primaryCategorySlug = categories.find(
    (category) => category.name === primaryCategory,
  )?.slug;

  function goToCatalog(query = "") {
    const catalogQuery = query.trim();

    router.push(
      catalogQuery
        ? `/catalogo?q=${encodeURIComponent(catalogQuery)}`
        : "/catalogo",
    );
  }

  function addSelectedPresentation() {
    const selection = createProductCartSelection(
      product,
      selectedPresentationLabel,
    );

    if (!selection) return;

    cart.addItem(
      selection.product,
      selection.presentation,
      selection.quantity,
    );
    setFeedback(
      `${product.nombre} · ${selection.presentation.etiqueta} agregado al carrito`,
    );
    cart.openCart();
  }

  return (
    <div className="min-h-screen bg-[#fffdf9] pb-24">
      <Header
        sectionLinks={[{ id: "producto", label: "Producto" }]}
        categories={categories}
        activeCategory={primaryCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSubmitSearch={() => goToCatalog(searchQuery)}
        onClearSearch={() => setSearchQuery("")}
        totalItems={cart.totalItems}
        onOpenCart={cart.openCart}
      />

      <main id="main-content">
        <section id="producto" className="container-shell scroll-mt-44 py-5 sm:py-8 lg:py-10">
          <div className="mx-auto max-w-[1120px]">
            <Link
              href={primaryCategorySlug ? `/categoria/${primaryCategorySlug}` : "/"}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg text-sm font-medium text-olive-dark/75 hover:text-olive-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-olive/30"
            >
              <span aria-hidden="true">←</span>{" "}
              {primaryCategorySlug ? `Volver a ${primaryCategory}` : "Volver a Inicio"}
            </Link>

            <article className="mt-4 grid min-w-0 gap-6 sm:mt-6 sm:gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start lg:gap-10">
              <div className="relative mx-auto aspect-[4/3] w-full max-w-[480px] overflow-hidden rounded-2xl border border-olive/15 bg-[#f7f4eb] lg:mx-0 lg:aspect-square">
                <Image
                  src={product.imagen}
                  alt={product.nombre}
                  fill
                  sizes="(max-width: 639px) calc(100vw - 16px), 480px"
                  className="object-contain"
                  preload
                />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold tracking-[0.12em] text-olive-dark/65 uppercase">
                  {primaryCategory}
                </p>
                <h1 className="mt-2 font-display text-[2rem] leading-[1.08] font-semibold break-words text-olive-dark sm:text-[2.5rem]">
                  {product.nombre}
                </h1>
                <p className="mt-3 text-sm leading-6 text-foreground/75 sm:text-[15px]">
                  {product.descripcion}
                </p>

                <div className="mt-6 rounded-2xl border border-olive/15 bg-cream/50 p-4 sm:p-5">
                  {selectedPresentation ? (
                    <>
                      <p className="text-xs font-semibold text-olive-dark">
                        Presentación
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {product.presentaciones.map((presentation) => {
                          const isSelected =
                            presentation.etiqueta === selectedPresentation.etiqueta;

                          return (
                            <button
                              key={presentation.etiqueta}
                              type="button"
                              onClick={() => {
                                setSelectedPresentationLabel(presentation.etiqueta);
                                setFeedback("");
                              }}
                              className={`min-h-[44px] min-w-[72px] rounded-xl border px-4 py-2.5 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-olive/40 focus-visible:ring-offset-2 ${
                                isSelected
                                  ? "border-olive-dark bg-olive-dark text-white"
                                  : "border-olive/20 bg-background text-olive-dark hover:border-olive/40 hover:bg-white"
                              }`}
                              aria-pressed={isSelected}
                            >
                              {presentation.etiqueta}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-5 border-t border-olive/12 pt-5">
                        <p className="text-[28px] leading-tight font-bold text-olive-dark tabular-nums sm:text-[32px]">
                          {formatARS(selectedPresentation.precio)}
                        </p>
                        <p className="mt-1 text-sm text-foreground/65">
                          por {selectedPresentation.etiqueta}
                        </p>
                      </div>
                    </>
                  ) : null}

                  <button
                    type="button"
                    disabled={!selectedPresentation}
                    onClick={addSelectedPresentation}
                    className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-olive px-5 py-3 text-sm font-semibold text-white hover:bg-olive-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-olive/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    Agregar al carrito
                  </button>
                  <p
                    className="mt-3 min-h-5 text-center text-xs font-medium text-olive-dark"
                    aria-live="polite"
                  >
                    {feedback}
                  </p>
                </div>
              </div>
            </article>
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
    </div>
  );
}
