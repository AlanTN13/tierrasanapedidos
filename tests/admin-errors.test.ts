import assert from "node:assert/strict";
import test from "node:test";
import { AdminInputError, productErrorResult, UNKNOWN_SAVE_ERROR } from "../lib/admin-form-result.ts";
import { parsePresentations, validateProductIdentity } from "../lib/product-form-validation.ts";

test("expected errors identify the field without exposing internals", () => {
  assert.deepEqual(productErrorResult(new AdminInputError("Elegí una categoría.", "categoryIds")), {
    error: "Elegí una categoría.", field: "categoryIds", fieldIndex: undefined,
  });
});
for (const [constraint, field] of [
  ["products_base_sku_unique_idx", "baseSku"],
  ["products_slug_key", "slug"],
  ["product_presentations_sku_unique_idx", "presentationSkuOverride"],
]) {
  test(`database conflict ${constraint} becomes actionable feedback`, () => {
    const result = productErrorResult({ code: "23505", message: `duplicate key value violates unique constraint "${constraint}"` });
    assert.equal(result.field, field);
    assert.ok(!result.error.includes(constraint));
    assert.ok(!result.error.includes("23505"));
  });
}
test("unknown failures never expose SQL, table contents or raw error messages", () => {
  for (const error of [new Error("SECRET internal SQL"), { message: "SQL auth token" }, null, "SELECT private"]) {
    assert.deepEqual(productErrorResult(error), { error: UNKNOWN_SAVE_ERROR });
  }
});

function presentationForm(amount = "250", price = "2.500,50") {
  const data = new FormData();
  data.append("presentationAmountValue", "1"); // optional unfilled row before a real row
  data.append("presentationPrice", "");
  data.append("presentationMeasurementKind", "unit");
  data.append("presentationAmountUnit", "unit");
  data.append("presentationAmountValue", amount);
  data.append("presentationPrice", price);
  data.append("presentationMeasurementKind", "weight");
  data.append("presentationAmountUnit", "g");
  return data;
}
test("presentation parsing preserves amount, ARS cents and original form row", () => {
  const rows = parsePresentations(presentationForm(), "CACAO");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].formIndex, 1);
  assert.equal(rows[0].amountInBaseUnits, 250);
  assert.equal(rows[0].priceCents, 250050);
  assert.equal(rows[0].sku, "CACAO-250G");
});
for (const [amount, price, field] of [["abc", "1500", "presentationAmountValue"], ["-1", "1500", "presentationAmountValue"], ["0", "1500", "presentationAmountValue"], ["250", "10pesos", "presentationPrice"], ["250", "0", "presentationPrice"]]) {
  test(`invalid amount/price ${amount}/${price} is rejected with its original row`, () => {
    assert.throws(() => parsePresentations(presentationForm(amount, price), "CACAO"), (error: unknown) =>
      error instanceof AdminInputError && error.field === field && error.fieldIndex === 1,
    );
  });
}

// Query double exposes only read methods: a preflight attempting a write would fail.
function database(products: Array<Record<string, string>> = [], presentations: Array<Record<string, string>> = []) {
  const calls: string[] = [];
  const client = {
    from(table: string) {
      calls.push(table);
      let rows = table === "products" ? products : presentations;
      const query = {
        select() { return query; },
        eq(field: string, value: string) { rows = rows.filter((row) => row[field] === value); return query; },
        neq(field: string, value: string) { rows = rows.filter((row) => row[field] !== value); return query; },
        limit() { return query; },
        in(field: string, values: string[]) { rows = rows.filter((row) => values.includes(row[field])); return query; },
        then(resolve: (value: unknown) => void) { resolve({ data: rows, error: null }); },
      };
      return query;
    },
  } as unknown as Parameters<typeof validateProductIdentity>[0];
  return { client, calls };
}
function payload(productId = "") {
  return { productId, slug: "nuevo", baseSku: "CACAO", presentations: parsePresentations(presentationForm(), "CACAO") };
}
test("duplicate base SKU is rejected before any presentation query or mutation", async () => {
  const { client, calls } = database([{ id: "existing", slug: "otro", base_sku: "CACAO" }]);
  await assert.rejects(validateProductIdentity(client, payload()), (error: unknown) => error instanceof AdminInputError && error.field === "baseSku");
  assert.deepEqual(calls, ["products", "products"]);
});
test("editing the same product does not reject its own SKU or slug", async () => {
  const { client } = database([{ id: "own", slug: "nuevo", base_sku: "CACAO" }]);
  await validateProductIdentity(client, payload("own"));
});
test("presentation SKU belonging to another product is rejected", async () => {
  const { client } = database([], [{ id: "other-presentation", product_id: "other", sku: "CACAO-250G" }]);
  await assert.rejects(validateProductIdentity(client, payload()), (error: unknown) => error instanceof AdminInputError && error.fieldIndex === 1);
});
test("retry after a partial save reuses the saved presentation ID", async () => {
  const { client } = database([], [{ id: "saved-presentation", product_id: "own", sku: "CACAO-250G" }]);
  const data = payload("own");
  await validateProductIdentity(client, data);
  assert.equal(data.presentations[0].id, "saved-presentation");
});
test("same SKU in two input rows is rejected before querying presentations", async () => {
  const { client, calls } = database();
  const data = payload();
  data.presentations.push({ ...data.presentations[0], formIndex: 3 });
  await assert.rejects(validateProductIdentity(client, data), (error: unknown) => error instanceof AdminInputError && error.fieldIndex === 3);
  assert.ok(!calls.includes("product_presentations"));
});
