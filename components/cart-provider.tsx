"use client";

import {
  createContext,
  useEffect,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { CartItem, Product, ProductPresentation } from "@/types/catalog";
import { NOVEMBER_PROMOTION, normalizeCoupon, quoteCart, toCents, type Promotion, type CartQuote } from "@/lib/promotions";
import { readCoupon, writeCoupon, subscribeCoupon } from "@/lib/coupon-storage";
import { trackCampaign } from "@/lib/campaign-events";
import { PromotionPopup } from "@/components/promotion-popup";

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  subtotal: number;
  couponCode: string;
  quote: CartQuote;
  promotion: Promotion;
  now: number;
  checkoutNow: () => number;
  isPreview: boolean;
  applyCoupon: (code: string) => CartQuote;
  removeCoupon: () => void;
  openCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
  addItem: (
    product: Product,
    presentation: ProductPresentation,
    quantity: number,
  ) => void;
  updateQuantity: (
    productId: string,
    presentationLabel: ProductPresentation["etiqueta"],
    quantity: number,
  ) => void;
  removeItem: (
    productId: string,
    presentationLabel: ProductPresentation["etiqueta"],
  ) => void;
};

const STORAGE_KEY = "tierra-sana-cart";
const STORAGE_EVENT = "tierra-sana-cart-updated";
const EMPTY_CART: CartItem[] = [];

const snapshots = new Map<string, { items: CartItem[]; serialized: string }>();

const CartContext = createContext<CartContextValue | null>(null);

function readCartSnapshot(key = STORAGE_KEY): CartItem[] {
  if (typeof window === "undefined") return EMPTY_CART;
  const cached = snapshots.get(key);
  try {
    const serialized = window.localStorage.getItem(key) ?? "[]";
    if (cached?.serialized === serialized) return cached.items;
    const items = JSON.parse(serialized) as CartItem[];
    snapshots.set(key, { items, serialized });
    return items;
  } catch {
    return cached?.items ?? EMPTY_CART;
  }
}

function subscribeToCart(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleChange = () => callback();

  window.addEventListener("storage", handleChange);
  window.addEventListener(STORAGE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(STORAGE_EVENT, handleChange);
  };
}

function writeCartSnapshot(items: CartItem[], key = STORAGE_KEY) {
  const serialized = JSON.stringify(items);
  snapshots.set(key, { items, serialized });
  try { window.localStorage.setItem(key, serialized); } catch { /* In-memory session fallback. */ }
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function addItemToStoredCart(
  product: Product,
  presentation: ProductPresentation,
  quantity: number,
  storageKey = STORAGE_KEY,
) {
  if (typeof window === "undefined") {
    return;
  }

  const currentItems = readCartSnapshot(storageKey);
  const existingItem = currentItems.find(
    (item) =>
      item.product.id === product.id &&
      item.presentation.etiqueta === presentation.etiqueta,
  );

  if (!existingItem) {
    writeCartSnapshot([...currentItems, { product, presentation, quantity }], storageKey);
    return;
  }

  writeCartSnapshot(
    currentItems.map((item) =>
      item.product.id === product.id &&
      item.presentation.etiqueta === presentation.etiqueta
        ? { ...item, quantity: item.quantity + quantity }
        : item,
    ),
    storageKey,
  );
}

export function CartProvider({ children, promotion = NOVEMBER_PROMOTION, previewNow }: {
  children: ReactNode;
  promotion?: Promotion;
  previewNow?: number;
}) {
  const isPreview = previewNow !== undefined;
  const storageKey = isPreview ? `${STORAGE_KEY}-preview` : STORAGE_KEY;
  const couponScope = isPreview ? "preview" : "public";
  const items = useSyncExternalStore(
    subscribeToCart,
    () => readCartSnapshot(storageKey),
    () => EMPTY_CART,
  );
  const [isOpen, setIsOpen] = useState(false);
  const couponCode = useSyncExternalStore(subscribeCoupon, () => readCoupon(couponScope), () => "");
  // Stable SSR snapshot; the effect starts the clock after hydration.
  const [clock, setClock] = useState(0);
  const now = previewNow ?? clock;
  useEffect(() => {
    // Wake exactly at campaign boundaries, also when a sleeping tab returns.
    let timer: ReturnType<typeof setTimeout>;
    function tick() {
      const current = Date.now();
      setClock(current);
      const nextBoundary = [Date.parse(promotion.startsAt), Date.parse(promotion.endsAt)]
        .filter((date) => date > current).sort((a, b) => a - b)[0];
      timer = setTimeout(tick, Math.min(60_000, nextBoundary ? nextBoundary - current : 60_000));
    }
    timer = setTimeout(tick, 0);
    const resume = () => { clearTimeout(timer); tick(); };
    window.addEventListener("focus", resume);
    document.addEventListener("visibilitychange", resume);
    return () => { clearTimeout(timer); window.removeEventListener("focus", resume); document.removeEventListener("visibilitychange", resume); };
  }, [promotion.startsAt, promotion.endsAt]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + toCents(item.presentation.precio) * item.quantity,
    0,
  ) / 100;

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isOpen,
      totalItems,
      subtotal,
      couponCode,
      isPreview,
      quote: quoteCart(toCents(subtotal), couponCode, now, promotion),
      promotion,
      now,
      checkoutNow: () => previewNow ?? Date.now(),
      applyCoupon: (code) => {
        const result = quoteCart(toCents(subtotal), normalizeCoupon(code), previewNow ?? Date.now(), promotion);
        // Keep a valid pending coupon below the threshold. Unknown/inactive codes never replace it.
        if (result.status === "applied" || result.status === "minimum") writeCoupon(result.code ?? "", couponScope);
        trackCampaign("coupon_apply", { status: result.status, subtotal_cents: result.subtotalCents, discount_cents: result.discountCents });
        return result;
      },
      removeCoupon: () => { writeCoupon("", couponScope); trackCampaign("coupon_remove"); },
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      clearCart: () => {
        writeCartSnapshot(EMPTY_CART, storageKey);
        setIsOpen(false);
      },
      addItem: (product, presentation, quantity) => {
        addItemToStoredCart(product, presentation, quantity, storageKey);
      },
      updateQuantity: (productId, presentationLabel, quantity) => {
        const currentItems = readCartSnapshot(storageKey);

        if (quantity <= 0) {
          writeCartSnapshot(
            currentItems.filter(
              (item) =>
                !(
                  item.product.id === productId &&
                  item.presentation.etiqueta === presentationLabel
                ),
            ),
            storageKey,
          );
          return;
        }

        writeCartSnapshot(
          currentItems.map((item) =>
            item.product.id === productId &&
            item.presentation.etiqueta === presentationLabel
              ? { ...item, quantity }
              : item,
          ),
          storageKey,
        );
      },
      removeItem: (productId, presentationLabel) => {
        writeCartSnapshot(
          readCartSnapshot(storageKey).filter(
            (item) =>
              !(
                item.product.id === productId &&
                item.presentation.etiqueta === presentationLabel
              ),
          ),
          storageKey,
        );
      },
    }),
    [isOpen, items, subtotal, totalItems, couponCode, now, promotion, previewNow, isPreview, storageKey, couponScope],
  );

  return <CartContext.Provider value={value}>{children}<PromotionPopup /></CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
