"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CartDrawer } from "@/components/cart-drawer";
import { CartProvider, useCart } from "@/components/cart-provider";
import { FloatingWhatsAppButton } from "@/components/floating-whatsapp-button";
import { Header } from "@/components/header";
import type { FilterCategory } from "@/types/catalog";

export function RecipesStorefrontShell({
  categories,
  children,
}: {
  categories: FilterCategory[];
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
  categories: FilterCategory[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const cart = useCart();
  const activeCategory = categories[0] ?? "Destacados";

  function goToCatalog(query = "", category?: FilterCategory) {
    const searchParams = new URLSearchParams();
    const catalogQuery = query.trim() || (category !== "Destacados" ? category : "");
    if (catalogQuery) searchParams.set("q", catalogQuery);
    router.push(`/${searchParams.size ? `?${searchParams.toString()}` : ""}#productos`);
  }

  return (
    <div className="pb-20 sm:pb-24">
      <Header
        sectionLinks={[
          { id: "recetas", label: "Recetas" },
          { id: "productos-receta", label: "Comprar ingredientes" },
        ]}
        categories={categories}
        activeCategory={activeCategory}
        onChangeCategory={(category) => goToCatalog("", category)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSubmitSearch={() => goToCatalog(searchQuery)}
        onClearSearch={() => setSearchQuery("")}
        totalItems={cart.totalItems}
        onOpenCart={cart.openCart}
      />
      {children}
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
