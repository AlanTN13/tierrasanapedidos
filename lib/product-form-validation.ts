import type { SupabaseClient } from "@supabase/supabase-js";
import { AdminInputError } from "./admin-form-result.ts";
import { calculateAmountInBaseUnits, formatPresentationLabel, normalizeMeasurementUnitForKind, parseMeasurementValue, type PresentationMeasurementKind, type PresentationMeasurementUnit } from "./presentation.ts";
import { generatePresentationSku, normalizeManualSku } from "./sku.ts";

export type ParsedPresentation = {
  id: string | undefined;
  formIndex: number;
  sku: string;
  label: string;
  measurementKind: PresentationMeasurementKind;
  amountValue: number;
  amountUnit: PresentationMeasurementUnit;
  amountInBaseUnits: number;
  priceCents: number;
  sortOrder: number;
};

export async function validateProductIdentity(
  supabase: Pick<SupabaseClient, "from">,
  { productId, slug, baseSku, presentations }: {
    productId: string;
    slug: string;
    baseSku: string;
    presentations: ParsedPresentation[];
  },
) {
  for (const [column, value, field, message] of [
    ["slug", slug, "slug", "Este slug ya existe. Editá el producto existente o elegí otro slug."],
    ["base_sku", baseSku, "baseSku", "Este SKU base ya existe. Si es el mismo producto, abrilo desde Editar. Si es otro producto, usá un SKU base distinto."],
  ] as const) {
    let query = supabase.from("products").select("id").eq(column, value).limit(1);
    if (productId) query = query.neq("id", productId);
    const { data, error } = await query;
    if (error) {
      if (column === "base_sku" && isMissingColumnError(error.message)) continue;
      throw error;
    }
    if (data?.length) throw new AdminInputError(message, field);
  }

  const skus = presentations.map((presentation) => presentation.sku);
  const duplicateIndex = skus.findIndex((sku, index) => skus.indexOf(sku) !== index);
  if (duplicateIndex >= 0) {
    throw new AdminInputError("Hay dos presentaciones con el mismo SKU. Revisá el contenido o el SKU manual de cada una.", "presentationSkuOverride", presentations[duplicateIndex].formIndex);
  }
  const { data, error } = await supabase.from("product_presentations")
    .select("id, product_id, sku").in("sku", skus);
  if (error) {
    if (isMissingColumnError(error.message)) return;
    throw error;
  }
  for (const presentation of presentations) {
    const match = data?.find((item) => item.sku === presentation.sku);
    if (!match) continue;
    if (match.product_id !== productId || (presentation.id && presentation.id !== match.id)) {
      throw new AdminInputError("El SKU de esta presentación ya existe. Revisalo o editá la presentación existente.", "presentationSkuOverride", presentation.formIndex);
    }
    // Retry a partially saved new product without inserting its presentations twice.
    presentation.id = match.id;
  }
}

export function parsePresentations(formData: FormData, baseSku: string): ParsedPresentation[] {
  const ids = formData.getAll("presentationId").map((value) => readString(value));
  const skuOverrides = formData
    .getAll("presentationSkuOverride")
    .map((value) => readString(value));
  const measurementKinds = formData
    .getAll("presentationMeasurementKind")
    .map((value) => readString(value));
  const amountValues = formData
    .getAll("presentationAmountValue")
    .map((value) => readString(value));
  const amountUnits = formData
    .getAll("presentationAmountUnit")
    .map((value) => readString(value));
  const prices = formData.getAll("presentationPrice").map((value) => readString(value));
  const sortOrders = formData
    .getAll("presentationSortOrder")
    .map((value) => readString(value));

  const parsedPresentations = amountValues
    .map((rawAmountValue, index) => {
      const price = prices[index] ?? "";
      const rawMeasurementKind = measurementKinds[index] ?? "unit";
      const rawAmountUnit = amountUnits[index] ?? "unit";

      if (!rawAmountValue || !price) {
        return null;
      }

      const measurementKind = parseMeasurementKind(rawMeasurementKind);
      let amountValue: number;
      try {
        if (!/^(?:\d+(?:[.,]\d+)?|\d{1,3}(?:\.\d{3})+,\d+)$/.test(rawAmountValue)) throw new Error();
        amountValue = parseMeasurementValue(rawAmountValue);
      } catch {
        throw new AdminInputError("Revisá el contenido de la presentación. Usá un número mayor a cero.", "presentationAmountValue", index);
      }
      const amountUnit = normalizeMeasurementUnitForKind(
        measurementKind,
        rawAmountUnit,
      );
      const amountInBaseUnits = calculateAmountInBaseUnits({
        amountValue,
        amountUnit,
      });

      if (!Number.isFinite(amountValue) || amountValue <= 0 || !Number.isFinite(amountInBaseUnits) || amountInBaseUnits <= 0) {
        throw new AdminInputError("El contenido de la presentación debe ser un número mayor a cero.", "presentationAmountValue", index);
      }
      let priceCents: number;
      try {
        priceCents = parseCurrencyToCents(price);
      } catch {
        throw new AdminInputError("Revisá el precio de la presentación. Usá un importe numérico mayor a cero.", "presentationPrice", index);
      }
      if (!Number.isSafeInteger(priceCents) || priceCents <= 0) {
        throw new AdminInputError("El precio de la presentación debe ser mayor a cero.", "presentationPrice", index);
      }

      return {
        formIndex: index,
        id: ids[index] || undefined,
        sku:
          normalizeManualSku(skuOverrides[index] ?? "") ||
          generatePresentationSku({
            baseSku,
            measurementKind,
            amountValue,
            amountUnit,
          }),
        label: formatPresentationLabel({
          measurementKind,
          amountValue,
          amountUnit,
        }),
        measurementKind,
        amountValue,
        amountUnit,
        amountInBaseUnits,
        priceCents,
        sortOrder: Number.parseInt(sortOrders[index] || String(index), 10) || index,
      };
    })
    .filter((value): value is ParsedPresentation => Boolean(value));

  return parsedPresentations;
}

function parseMeasurementKind(value: string): PresentationMeasurementKind {
  if (value === "weight" || value === "volume") {
    return value;
  }

  return "unit";
}

function parseCurrencyToCents(value: string) {
  if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(value.trim())) {
    throw new Error("Precio inválido");
  }
  const normalized = value.replace(/\./g, "").replace(",", ".").trim();
  const amount = Number.parseFloat(normalized);

  if (Number.isNaN(amount)) {
    throw new Error(`Precio inválido: ${value}`);
  }

  return Math.round(amount * 100);
}

function readString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function isMissingColumnError(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes("does not exist") || normalized.includes("schema cache");
}
