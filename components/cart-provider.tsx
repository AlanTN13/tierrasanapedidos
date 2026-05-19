"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { CartItem, Product, ProductPresentation } from "@/types/catalog";

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  subtotal: number;
  openCart: () => void;
  closeCart: () => void;
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

let cartSnapshot: CartItem[] = EMPTY_CART;
let lastSerializedCart = JSON.stringify(EMPTY_CART);

const CartContext = createContext<CartContextValue | null>(null);

function readCartSnapshot(): CartItem[] {
  if (typeof window === "undefined") {
    return cartSnapshot;
  }

  try {
    const savedCart = window.localStorage.getItem(STORAGE_KEY) ?? lastSerializedCart;

    if (savedCart === lastSerializedCart) {
      return cartSnapshot;
    }

    cartSnapshot = JSON.parse(savedCart) as CartItem[];
    lastSerializedCart = savedCart;
    return cartSnapshot;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    cartSnapshot = EMPTY_CART;
    lastSerializedCart = JSON.stringify(EMPTY_CART);
    return cartSnapshot;
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

function writeCartSnapshot(items: CartItem[]) {
  cartSnapshot = items;
  lastSerializedCart = JSON.stringify(items);
  window.localStorage.setItem(STORAGE_KEY, lastSerializedCart);
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(
    subscribeToCart,
    readCartSnapshot,
    () => EMPTY_CART,
  );
  const [isOpen, setIsOpen] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.presentation.precio * item.quantity,
    0,
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isOpen,
      totalItems,
      subtotal,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem: (product, presentation, quantity) => {
        const currentItems = readCartSnapshot();
        const existingItem = currentItems.find(
          (item) =>
            item.product.id === product.id &&
            item.presentation.etiqueta === presentation.etiqueta,
        );

        if (!existingItem) {
          writeCartSnapshot([...currentItems, { product, presentation, quantity }]);
        } else {
          writeCartSnapshot(
            currentItems.map((item) =>
              item.product.id === product.id &&
              item.presentation.etiqueta === presentation.etiqueta
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            ),
          );
        }
      },
      updateQuantity: (productId, presentationLabel, quantity) => {
        const currentItems = readCartSnapshot();

        if (quantity <= 0) {
          writeCartSnapshot(
            currentItems.filter(
              (item) =>
                !(
                  item.product.id === productId &&
                  item.presentation.etiqueta === presentationLabel
                ),
            ),
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
        );
      },
      removeItem: (productId, presentationLabel) => {
        writeCartSnapshot(
          readCartSnapshot().filter(
            (item) =>
              !(
                item.product.id === productId &&
                item.presentation.etiqueta === presentationLabel
              ),
          ),
        );
      },
    }),
    [isOpen, items, subtotal, totalItems],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
