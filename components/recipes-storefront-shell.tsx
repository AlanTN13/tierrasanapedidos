"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CartDrawer } from "@/components/cart-drawer";
import { CartProvider, useCart } from "@/components/cart-provider";
import { FloatingWhatsAppButton } from "@/components/floating-whatsapp-button";
import { Header } from "@/components/header";
import { StorefrontFooter } from "@/components/storefront-footer";
import type { CatalogCategory } from "@/types/catalog";

export function RecipesStorefrontShell({
  categories,
  children,
}: {
  categories: CatalogCategory[];
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <RecipesStorefrontContent categories={categories}>{children}</RecipesStorefrontContent>
    </CartProvider>
  );
}

function RecipesStorefrontContent({
  categories,
  children,
}: {
  categories: CatalogCategory[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const cart = useCart();
  const activeCategory = categories[0]?.name ?? null;

  function goToCatalog(query = "") {
    const catalogQuery = query.trim();
    router.push(
      catalogQuery
        ? `/catalogo?q=${encodeURIComponent(catalogQuery)}`
        : "/catalogo",
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fffdf9]">
      <Header
        sectionLinks={[
          { id: "recetas", label: "Recetas" },
          { id: "productos-receta", label: "Comprar ingredientes" },
        ]}
        categories={categories}
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSubmitSearch={() => goToCatalog(searchQuery)}
        onClearSearch={() => setSearchQuery("")}
        totalItems={cart.totalItems}
        onOpenCart={cart.openCart}
      />
      {children}
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
    </div>
  );
}
