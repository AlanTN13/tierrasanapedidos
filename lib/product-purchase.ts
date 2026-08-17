import type { Product, ProductPresentation } from "../types/catalog";

const PREFERRED_PRESENTATION_BY_CATEGORY: Record<
  string,
  ProductPresentation["etiqueta"]
> = {
  Legumbres: "500g",
  Semillas: "250g",
};

export function getDefaultProductPresentation(product: Product) {
  const primaryCategory = product.categorias?.[0] ?? product.categoria;
  const preferredLabel = PREFERRED_PRESENTATION_BY_CATEGORY[primaryCategory];

  return (
    product.presentaciones.find(
      ({ etiqueta }) => etiqueta === preferredLabel,
    ) ?? product.presentaciones[0] ?? null
  );
}

export function getProductPresentationByLabel(
  product: Product,
  label: ProductPresentation["etiqueta"],
) {
  return (
    product.presentaciones.find(({ etiqueta }) => etiqueta === label) ??
    getDefaultProductPresentation(product)
  );
}

export function createProductCartSelection(
  product: Product,
  label: ProductPresentation["etiqueta"],
) {
  const presentation = getProductPresentationByLabel(product, label);

  return presentation
    ? { product, presentation, quantity: 1 as const }
    : null;
}
