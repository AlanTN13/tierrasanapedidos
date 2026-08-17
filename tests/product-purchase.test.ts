import assert from "node:assert/strict";
import test from "node:test";
import {
  createProductCartSelection,
  getProductPresentationByLabel,
} from "../lib/product-purchase.ts";
import type { Product, ProductPresentation } from "../types/catalog.ts";

function presentation(etiqueta: string, precio: number): ProductPresentation {
  return {
    etiqueta,
    precio,
    measurementKind: "weight",
    amountValue: Number.parseInt(etiqueta, 10),
    amountUnit: "g",
    amountInBaseUnits: Number.parseInt(etiqueta, 10),
  };
}

const product: Product = {
  id: "almendras",
  nombre: "Almendras",
  categoria: "Frutos secos y snack",
  descripcion: "",
  imagen: "/productos/almendras.webp",
  destacado: true,
  presentaciones: [
    presentation("250g", 3200),
    presentation("500g", 5900),
  ],
};

test("cambiar la presentación modifica el precio seleccionado", () => {
  assert.equal(getProductPresentationByLabel(product, "250g")?.precio, 3200);
  assert.equal(getProductPresentationByLabel(product, "500g")?.precio, 5900);
});

test("agregar desde PDP usa la presentación seleccionada", () => {
  const selection = createProductCartSelection(product, "500g");

  assert.equal(selection?.presentation.etiqueta, "500g");
  assert.equal(selection?.presentation.precio, 5900);
  assert.equal(selection?.quantity, 1);
});
