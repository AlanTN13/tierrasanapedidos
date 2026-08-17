import assert from "node:assert/strict";
import test from "node:test";
import {
  addRecipeCartItems,
  getDefaultRecipeCartItems,
} from "../lib/recipe-cart.ts";
import type { Product, ProductPresentation } from "../types/catalog.ts";

function presentation(
  etiqueta: string,
  precio: number,
): ProductPresentation {
  return {
    etiqueta,
    precio,
    measurementKind: "weight",
    amountValue: Number.parseInt(etiqueta, 10),
    amountUnit: "g",
    amountInBaseUnits: Number.parseInt(etiqueta, 10),
  };
}

function product(
  id: string,
  nombre: string,
  categoria: string,
  presentaciones: ProductPresentation[],
): Product {
  return {
    id,
    nombre,
    categoria,
    descripcion: "",
    presentaciones,
    imagen: "/productos/placeholder.svg",
    destacado: false,
  };
}

test("prepara todos los productos de una receta en cantidad 1", () => {
  const chips = product("chips", "Chips chocolate negro", "Repostería", [
    presentation("100g", 2500),
  ]);
  const pastaMani = product(
    "pasta-mani",
    "Pasta Maní Entrenuts Coco",
    "Untables",
    [presentation("unidad", 3800)],
  );

  const items = getDefaultRecipeCartItems([chips, pastaMani]);

  assert.deepEqual(
    items.map(({ product: itemProduct, presentation: itemPresentation, quantity }) => ({
      name: itemProduct.nombre,
      presentation: itemPresentation.etiqueta,
      quantity,
    })),
    [
      {
        name: "Chips chocolate negro",
        presentation: "100g",
        quantity: 1,
      },
      {
        name: "Pasta Maní Entrenuts Coco",
        presentation: "unidad",
        quantity: 1,
      },
    ],
  );
});

test("elige la presentación por defecto acordada cuando corresponde", () => {
  const semillas = product("chia", "Semillas de chía", "Semillas", [
    presentation("100g", 1000),
    presentation("250g", 2100),
  ]);
  const legumbres = product("lentejas", "Lentejas", "Legumbres", [
    presentation("250g", 900),
    presentation("500g", 1600),
  ]);

  assert.deepEqual(
    getDefaultRecipeCartItems([semillas, legumbres]).map(
      ({ presentation: itemPresentation }) => itemPresentation.etiqueta,
    ),
    ["250g", "500g"],
  );
});

test("agrega cada producto una sola vez y omite productos sin presentación", () => {
  const validProduct = product("cacao", "Cacao", "Repostería", [
    presentation("100g", 1800),
  ]);
  const unavailableProduct = product("agotado", "Sin presentación", "Otros", []);
  const added: Array<{ name: string; presentation: string; quantity: number }> = [];
  const items = getDefaultRecipeCartItems([validProduct, unavailableProduct]);

  addRecipeCartItems(items, (itemProduct, itemPresentation, quantity) => {
    added.push({
      name: itemProduct.nombre,
      presentation: itemPresentation.etiqueta,
      quantity,
    });
  });

  assert.deepEqual(added, [
    { name: "Cacao", presentation: "100g", quantity: 1 },
  ]);
});

test("una receta sin productos no genera ninguna acción de carrito", () => {
  assert.deepEqual(getDefaultRecipeCartItems([]), []);
});
