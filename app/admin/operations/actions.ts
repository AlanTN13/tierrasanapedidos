"use server";

import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getLatestCostByPresentationId } from "@/lib/admin-operations";

type ParsedPurchaseItem = {
  productPresentationId: string;
  quantity: string;
  quantityValue: number;
  unitCostCents: number;
  lineTotalCents: number;
};

type ParsedSaleItem = {
  productPresentationId: string;
  quantity: string;
  quantityValue: number;
  unitPriceCents: number;
  lineTotalCents: number;
};

export async function savePurchaseOrder(formData: FormData) {
  const admin = await requireAdminUser();
  const supplierName = readString(formData.get("supplierName"));
  const referenceNumber = readNullableString(formData.get("referenceNumber"));
  const purchasedAt = readDateTimeOrNow(formData.get("purchasedAt"));
  const notes = readNullableString(formData.get("notes"));
  const items = parsePurchaseItems(formData);

  if (!supplierName) {
    throw new Error("La compra necesita un proveedor.");
  }

  if (items.length === 0) {
    throw new Error("Agregá al menos un ítem a la orden de compra.");
  }

  const supabase = await createClient();
  const { data: order, error: orderError } = await supabase
    .from("purchase_orders")
    .insert({
      supplier_name: supplierName,
      reference_number: referenceNumber,
      purchased_at: purchasedAt,
      notes,
      created_by: admin.userId,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    throw new Error(orderError?.message ?? "No se pudo crear la compra.");
  }

  const { error: itemsError } = await supabase.from("purchase_order_items").insert(
    items.map((item) => ({
      purchase_order_id: order.id,
      product_presentation_id: item.productPresentationId,
      quantity: item.quantity,
      unit_cost_cents: item.unitCostCents,
      line_total_cents: item.lineTotalCents,
    })),
  );

  if (itemsError) {
    await supabase.from("purchase_orders").delete().eq("id", order.id);
    throw new Error(itemsError.message);
  }

  redirect(`/admin/purchases/${order.id}?saved=1`);
}

export async function saveSale(formData: FormData) {
  const admin = await requireAdminUser();
  const soldAt = readDateTimeOrNow(formData.get("soldAt"));
  const channel = readString(formData.get("channel")) || "local";
  const notes = readNullableString(formData.get("notes"));
  const items = parseSaleItems(formData);

  if (items.length === 0) {
    throw new Error("Agregá al menos un ítem a la venta.");
  }

  const latestCostByPresentationId = await getLatestCostByPresentationId();
  const supabase = await createClient();
  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .insert({
      sold_at: soldAt,
      channel,
      notes,
      created_by: admin.userId,
    })
    .select("id")
    .single();

  if (saleError || !sale) {
    throw new Error(saleError?.message ?? "No se pudo crear la venta.");
  }

  const { error: itemsError } = await supabase.from("sale_items").insert(
    items.map((item) => {
      const unitCostSnapshotCents = latestCostByPresentationId.get(item.productPresentationId) ?? 0;
      const lineMarginCents =
        item.lineTotalCents - Math.round(unitCostSnapshotCents * item.quantityValue);

      return {
        sale_id: sale.id,
        product_presentation_id: item.productPresentationId,
        quantity: item.quantity,
        unit_price_cents: item.unitPriceCents,
        unit_cost_snapshot_cents: unitCostSnapshotCents,
        line_total_cents: item.lineTotalCents,
        line_margin_cents: lineMarginCents,
      };
    }),
  );

  if (itemsError) {
    await supabase.from("sales").delete().eq("id", sale.id);
    throw new Error(itemsError.message);
  }

  redirect(`/admin/sales/${sale.id}?saved=1`);
}

function parsePurchaseItems(formData: FormData) {
  const presentationIds = formData
    .getAll("linePresentationId")
    .map((value) => readString(value));
  const quantities = formData.getAll("lineQuantity").map((value) => readString(value));
  const unitCosts = formData.getAll("lineUnitCost").map((value) => readString(value));

  return presentationIds
    .map((productPresentationId, index) => {
      const quantity = quantities[index] ?? "";
      const unitCost = unitCosts[index] ?? "";

      if (!productPresentationId || !quantity || !unitCost) {
        return null;
      }

      const normalizedQuantity = parseQuantity(quantity);
      const unitCostCents = parseCurrencyToCents(unitCost);

      return {
        productPresentationId,
        quantity: formatNumericForDatabase(normalizedQuantity),
        quantityValue: normalizedQuantity,
        unitCostCents,
        lineTotalCents: Math.round(unitCostCents * normalizedQuantity),
      } satisfies ParsedPurchaseItem;
    })
    .filter((value): value is ParsedPurchaseItem => Boolean(value));
}

function parseSaleItems(formData: FormData) {
  const presentationIds = formData
    .getAll("linePresentationId")
    .map((value) => readString(value));
  const quantities = formData.getAll("lineQuantity").map((value) => readString(value));
  const unitPrices = formData.getAll("lineUnitPrice").map((value) => readString(value));

  return presentationIds
    .map((productPresentationId, index) => {
      const quantity = quantities[index] ?? "";
      const unitPrice = unitPrices[index] ?? "";

      if (!productPresentationId || !quantity || !unitPrice) {
        return null;
      }

      const normalizedQuantity = parseQuantity(quantity);
      const unitPriceCents = parseCurrencyToCents(unitPrice);

      return {
        productPresentationId,
        quantity: formatNumericForDatabase(normalizedQuantity),
        quantityValue: normalizedQuantity,
        unitPriceCents,
        lineTotalCents: Math.round(unitPriceCents * normalizedQuantity),
      } satisfies ParsedSaleItem;
    })
    .filter((value): value is ParsedSaleItem => Boolean(value));
}

function readString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function readNullableString(value: FormDataEntryValue | null) {
  const parsed = readString(value);
  return parsed || null;
}

function readDateTimeOrNow(value: FormDataEntryValue | null) {
  const parsed = readString(value);

  if (!parsed) {
    return new Date().toISOString();
  }

  const normalized = new Date(parsed);

  if (Number.isNaN(normalized.getTime())) {
    throw new Error(`Fecha inválida: ${parsed}`);
  }

  return normalized.toISOString();
}

function parseCurrencyToCents(value: string) {
  const normalized = normalizeDecimalInput(value);
  const amount = Number.parseFloat(normalized);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error(`Monto inválido: ${value}`);
  }

  return Math.round(amount * 100);
}

function parseQuantity(value: string) {
  const normalized = normalizeDecimalInput(value);
  const amount = Number.parseFloat(normalized);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`Cantidad inválida: ${value}`);
  }

  return amount;
}

function formatNumericForDatabase(value: number) {
  return value.toFixed(3).replace(/\.?0+$/, "");
}

function normalizeDecimalInput(value: string) {
  const trimmed = value.trim();

  if (trimmed.includes(",") && trimmed.includes(".")) {
    return trimmed.replace(/\./g, "").replace(",", ".");
  }

  if (trimmed.includes(",")) {
    return trimmed.replace(",", ".");
  }

  return trimmed;
}
