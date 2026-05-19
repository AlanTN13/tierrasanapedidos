"use client";

import { useState } from "react";
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
    addItem,
    removeItem,
    updateQuantity,
  } = useCart();

  function handleCategoryChange(category: FilterCategory) {
    setActiveCategory(category);

    requestAnimationFrame(() => {
      document.getElementById("productos")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  return (
    <div className="pb-28">
      <Header totalItems={totalItems} onOpenCart={openCart} />
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
                <ProductCard key={product.id} product={product} onAdd={addItem} />
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

        <section className="container-shell pb-4">
          <div className="surface-panel organic-outline rounded-[2rem] px-5 py-6 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="section-kicker">Pedido asistido</span>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground/68">
                  Los precios y stock pueden confirmarse por WhatsApp antes de
                  cerrar el pedido. Asi mantenemos una experiencia simple,
                  cercana y actualizada.
                </p>
              </div>
              <button
                type="button"
                onClick={openCart}
                className="inline-flex items-center justify-center rounded-full border border-olive/14 bg-white px-5 py-3 text-sm font-semibold text-olive-dark hover:border-olive/28 hover:bg-olive-soft/35 focus:outline-none focus:ring-2 focus:ring-olive/35"
              >
                Revisar carrito
              </button>
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
        onRemove={removeItem}
        onUpdateQuantity={updateQuantity}
      />
    </div>
  );
}
