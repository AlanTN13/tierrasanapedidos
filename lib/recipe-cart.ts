import type { Product, ProductPresentation } from "../types/catalog";
import { getDefaultProductPresentation } from "./product-purchase.ts";

export type RecipeCartItem = {
  product: Product;
  presentation: ProductPresentation;
  quantity: 1;
};

type AddCartItem = (
  product: Product,
  presentation: ProductPresentation,
  quantity: number,
) => void;

export function getDefaultRecipePresentation(product: Product) {
  return getDefaultProductPresentation(product);
}

export function getDefaultRecipeCartItems(products: Product[]) {
  return products.flatMap((product) => {
    const presentation = getDefaultRecipePresentation(product);

    return presentation
      ? [{ product, presentation, quantity: 1 as const }]
      : [];
  });
}

export function addRecipeCartItems(
  items: RecipeCartItem[],
  addItem: AddCartItem,
) {
  for (const { product, presentation, quantity } of items) {
    addItem(product, presentation, quantity);
  }
}

export function purchaseRecipeIngredients(
  products: Product[],
  addItem: AddCartItem,
  openCart: () => void,
) {
  const items = getDefaultRecipeCartItems(products);

  if (items.length === 0) {
    return 0;
  }

  addRecipeCartItems(items, addItem);
  openCart();
  return items.length;
}
