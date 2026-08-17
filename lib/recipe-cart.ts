import type { Product, ProductPresentation } from "../types/catalog";

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
  const preferredByCategory: Record<
    string,
    ProductPresentation["etiqueta"]
  > = {
    Legumbres: "500g",
    Semillas: "250g",
  };

  const primaryCategory = product.categorias?.[0] ?? product.categoria;

  return (
    product.presentaciones.find(
      ({ etiqueta }) =>
        etiqueta === preferredByCategory[primaryCategory],
    ) ?? product.presentaciones[0] ?? null
  );
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
