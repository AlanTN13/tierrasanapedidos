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
    <div className="pb-24">
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
        <section id="producto" className="container-shell py-6 sm:py-10 lg:py-14">
          <div className="mx-auto max-w-6xl">
            <Link
              href={primaryCategorySlug ? `/categoria/${primaryCategorySlug}` : "/"}
              className="inline-flex items-center gap-2 text-sm font-semibold text-olive-dark hover:text-olive"
            >
              <span aria-hidden="true">←</span>{" "}
              {primaryCategorySlug ? `Volver a ${primaryCategory}` : "Volver a Inicio"}
            </Link>

            <article className="mt-5 overflow-hidden rounded-[1.7rem] bg-[#fffdf9] shadow-[0_24px_70px_rgba(47,51,40,0.12)] ring-1 ring-olive/10 sm:mt-7 sm:rounded-[2.2rem] lg:grid lg:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)]">
              <div className="relative aspect-square overflow-hidden bg-olive-soft/32 lg:aspect-auto lg:min-h-[42rem]">
                <Image
                  src={product.imagen}
                  alt={product.nombre}
                  fill
                  sizes="(max-width: 1023px) 100vw, 52vw"
                  className="object-cover"
                  preload
                />
              </div>

              <div className="flex flex-col justify-center p-5 sm:p-8 lg:p-12">
                <p className="text-[11px] font-bold tracking-[0.15em] text-earth uppercase">
                  {primaryCategory}
                </p>
                <h1 className="mt-3 font-display text-[2.55rem] leading-[0.98] font-semibold text-olive-dark sm:text-5xl lg:text-6xl">
                  {product.nombre}
                </h1>
                <p className="mt-5 text-[15px] leading-7 text-foreground/68 sm:text-base">
                  {product.descripcion}
                </p>

                {selectedPresentation ? (
                  <div className="mt-7 border-y border-olive/12 py-5">
                    <p className="text-[11px] font-bold tracking-[0.14em] text-earth uppercase">
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
                            className={`rounded-full border px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-olive/30 ${
                              isSelected
                                ? "border-olive bg-olive text-white"
                                : "border-olive/14 bg-white text-olive-dark hover:bg-olive-soft/36"
                            }`}
                            aria-pressed={isSelected}
                          >
                            {presentation.etiqueta}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-6 flex items-end justify-between gap-4">
                      <div>
                        <p className="font-display text-4xl font-semibold text-olive-dark">
                          {formatARS(selectedPresentation.precio)}
                        </p>
                        <p className="mt-1 text-sm text-foreground/58">
                          por {selectedPresentation.etiqueta}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                <button
                  type="button"
                  disabled={!selectedPresentation}
                  onClick={addSelectedPresentation}
                  className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-olive px-5 py-3.5 text-sm font-semibold text-white hover:bg-olive-dark focus:outline-none focus:ring-2 focus:ring-olive/35 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Agregar al carrito
                </button>
                <p
                  className="mt-3 min-h-5 text-center text-xs font-semibold text-olive-dark"
                  aria-live="polite"
                >
                  {feedback}
                </p>
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
