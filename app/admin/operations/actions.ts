"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  getAdminPresentationOptions,
  getAdminPurchaseProductOptions,
  getInventorySummary,
  getLatestCostByPresentationId,
} from "@/lib/admin-operations";

type ParsedPurchaseItem = {
  productPresentationId: string;
  baseSku: string;
  presentationSku: string;
  amountInBaseUnits: number;
  lineTotalCents: number;
  storedQuantity: string;
  storedUnitCostCents: number;
};

type ParsedSaleItem = {
  productPresentationId: string;
  baseSku: string;
  presentationSku: string;
  amountInBaseUnits: number;
  quantity: string;
  quantityValue: number;
  unitPriceCents: number;
  lineTotalCents: number;
};

export type StockMovementFormState = {
  error: string | null;
};

const INITIAL_STOCK_MOVEMENT_STATE: StockMovementFormState = {
  error: null,
};

function isMissingColumnError(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes("does not exist") || normalized.includes("schema cache");
}

export async function savePurchaseOrder(formData: FormData) {
  const admin = await requireAdminUser();
  const supplierName = readString(formData.get("supplierName"));
  const referenceNumber = readNullableString(formData.get("referenceNumber"));
  const purchasedAt = readDateTimeOrNow(formData.get("purchasedAt"));
  const notes = readNullableString(formData.get("notes"));
  const items = await parsePurchaseItems(formData);

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

  const purchaseItemsPayload = items.map((item) => ({
    purchase_order_id: order.id,
    product_presentation_id: item.productPresentationId,
    base_sku_snapshot: item.baseSku,
    presentation_sku_snapshot: item.presentationSku,
    amount_in_base_units_snapshot: formatNumericForDatabase(item.amountInBaseUnits),
    quantity: item.storedQuantity,
    unit_cost_cents: item.storedUnitCostCents,
    line_total_cents: item.lineTotalCents,
  }));
  let itemsError = (
    await supabase.from("purchase_order_items").insert(purchaseItemsPayload)
  ).error;

  if (itemsError && isMissingColumnError(itemsError.message)) {
    itemsError = (
      await supabase.from("purchase_order_items").insert(
        items.map((item) => ({
          purchase_order_id: order.id,
          product_presentation_id: item.productPresentationId,
          quantity: item.storedQuantity,
          unit_cost_cents: item.storedUnitCostCents,
          line_total_cents: item.lineTotalCents,
        })),
      )
    ).error;
  }

  if (itemsError) {
    await supabase.from("purchase_orders").delete().eq("id", order.id);
    throw new Error(itemsError.message);
  }

  redirect(`/admin/purchases/${order.id}?saved=1`);
}

export async function saveSale(formData: FormData) {
  const admin = await requireAdminUser();
  const soldAt = readDateTimeOrNow(formData.get("soldAt"));
  const customerName = readNullableString(formData.get("channel"));
  const notes = readNullableString(formData.get("notes"));
  const items = await parseSaleItems(formData);

  if (items.length === 0) {
    throw new Error("Agregá al menos un ítem a la venta.");
  }

  const latestCostByPresentationId = await getLatestCostByPresentationId();
  const supabase = await createClient();
  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .insert({
      sold_at: soldAt,
      channel: customerName ?? undefined,
      notes,
      created_by: admin.userId,
    })
    .select("id")
    .single();

  if (saleError || !sale) {
    throw new Error(saleError?.message ?? "No se pudo crear la venta.");
  }

  const saleItemsPayload = items.map((item) => {
    const unitCostSnapshotCents = latestCostByPresentationId.get(item.productPresentationId) ?? 0;
    const lineMarginCents =
      item.lineTotalCents - Math.round(unitCostSnapshotCents * item.quantityValue);

    return {
      sale_id: sale.id,
      product_presentation_id: item.productPresentationId,
      base_sku_snapshot: item.baseSku,
      presentation_sku_snapshot: item.presentationSku,
      amount_in_base_units_snapshot: formatNumericForDatabase(item.amountInBaseUnits),
      quantity: item.quantity,
      unit_price_cents: item.unitPriceCents,
      unit_cost_snapshot_cents: unitCostSnapshotCents,
      line_total_cents: item.lineTotalCents,
      line_margin_cents: lineMarginCents,
    };
  });
  let itemsError = (await supabase.from("sale_items").insert(saleItemsPayload)).error;

  if (itemsError && isMissingColumnError(itemsError.message)) {
    itemsError = (
      await supabase.from("sale_items").insert(
        saleItemsPayload.map((item) => ({
          sale_id: item.sale_id,
          product_presentation_id: item.product_presentation_id,
          quantity: item.quantity,
          unit_price_cents: item.unit_price_cents,
          unit_cost_snapshot_cents: item.unit_cost_snapshot_cents,
          line_total_cents: item.line_total_cents,
          line_margin_cents: item.line_margin_cents,
        })),
      )
    ).error;
  }

  if (itemsError) {
    await supabase.from("sales").delete().eq("id", sale.id);
    throw new Error(itemsError.message);
  }

  redirect(`/admin/sales/${sale.id}?saved=1`);
}

export async function deletePurchaseOrder(
  _state: { error: string | null },
  formData: FormData,
) {
  await requireAdminUser();
  const recordId = readString(formData.get("recordId"));

  if (!recordId) {
    return {
      error: "No encontramos la compra a borrar.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("purchase_orders").delete().eq("id", recordId);

  if (error) {
    return {
      error: error.message,
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/purchases");
  redirect("/admin/purchases?deleted=1");
}

export async function deleteSale(
  _state: { error: string | null },
  formData: FormData,
) {
  await requireAdminUser();
  const recordId = readString(formData.get("recordId"));

  if (!recordId) {
    return {
      error: "No encontramos la venta a borrar.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("sales").delete().eq("id", recordId);

  if (error) {
    return {
      error: error.message,
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/sales");
  redirect("/admin/sales?deleted=1");
}

export async function saveStockMovement(
  state: StockMovementFormState = INITIAL_STOCK_MOVEMENT_STATE,
  formData: FormData,
) {
  void state;
  const admin = await requireAdminUser();
  const productId = readString(formData.get("productId"));
  const presentationId = readNullableString(formData.get("presentationId"));
  const movementType = readString(formData.get("movementType"));
  const quantityInput = readString(formData.get("quantity"));
  const reason = readString(formData.get("reason"));
  const notes = readNullableString(formData.get("notes"));

  if (!productId) {
    return { error: "Elegí un producto para registrar el movimiento." };
  }

  if (!["entry", "exit", "set"].includes(movementType)) {
    return { error: "Elegí un tipo de movimiento válido." };
  }

  if (!reason) {
    return { error: "El movimiento necesita un motivo." };
  }

  let quantityValue = 0;

  try {
    quantityValue = parseMovementQuantity(quantityInput, movementType === "set");
  } catch {
    return {
      error:
        movementType === "set"
          ? "Ingresá un stock físico válido mayor o igual a cero."
          : "Ingresá una cantidad válida mayor a cero.",
    };
  }

  const [presentationOptions, productOptions, inventorySummary] = await Promise.all([
    getAdminPresentationOptions(),
    getAdminPurchaseProductOptions(),
    getInventorySummary(),
  ]);
  const productOption = productOptions.find((item) => item.productId === productId);

  if (!productOption) {
    return { error: "No encontramos el producto seleccionado." };
  }

  const presentationOption = presentationId
    ? presentationOptions.find((item) => item.id === presentationId && item.productId === productId)
    : null;

  if (presentationId && !presentationOption) {
    return { error: "La presentación elegida no corresponde al producto." };
  }

  const inventory = inventorySummary.find((item) => item.productId === productId);
  const previousStock = inventory?.stockBaseUnits ?? 0;
  const baseUnitFactor = presentationOption?.amountInBaseUnits ?? 1;
  const requestedStockBaseUnits =
    movementType === "set"
      ? quantityValue * baseUnitFactor
      : quantityValue * baseUnitFactor * (movementType === "entry" ? 1 : -1);
  const quantityBaseUnits =
    movementType === "set"
      ? quantityValue * baseUnitFactor - previousStock
      : requestedStockBaseUnits;
  const newStock = previousStock + quantityBaseUnits;

  if (quantityBaseUnits === 0) {
    return { error: "Ese ajuste no cambia el stock actual." };
  }

  if (newStock < 0) {
    return {
      error: "El movimiento no puede dejar el stock en negativo. Revisá cantidad o tipo de movimiento.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("stock_movements").insert({
    product_id: productId,
    presentation_id: presentationOption?.id ?? null,
    movement_type: movementType,
    quantity: formatNumericForDatabase(quantityValue),
    quantity_base_units: formatNumericForDatabase(quantityBaseUnits),
    previous_stock: formatNumericForDatabase(previousStock),
    new_stock: formatNumericForDatabase(newStock),
    reason,
    notes,
    created_by: admin.userId,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/admin/purchases/new");
  revalidatePath("/admin/sales/new");
  revalidatePath("/admin/stock-movements");
  redirect("/admin/stock-movements?saved=1");
}

async function parsePurchaseItems(formData: FormData) {
  const productIds = formData
    .getAll("lineProductId")
    .map((value) => readString(value));
  const quantities = formData.getAll("lineQuantity").map((value) => readString(value));
  const unitCosts = formData.getAll("lineUnitCost").map((value) => readString(value));
  const purchaseOptions = await getAdminPurchaseProductOptions();

  return productIds
    .map((productId, index) => {
      const quantity = quantities[index] ?? "";
      const unitCost = unitCosts[index] ?? "";

      if (!productId || !quantity || !unitCost) {
        return null;
      }

      const option = purchaseOptions.find((item) => item.productId === productId);

      if (!option) {
        throw new Error(`Producto de compra inválido: ${productId}`);
      }

      const purchaseQuantityValue = parseQuantity(quantity);
      const unitCostCents = parseCurrencyToCents(unitCost);
      const totalBaseUnits = purchaseQuantityValue * option.purchaseUnitBaseAmount;
      const storedQuantityValue = totalBaseUnits / option.referencePresentationBaseAmount;
      const storedUnitCostCents =
        storedQuantityValue > 0
          ? Math.round((unitCostCents * purchaseQuantityValue) / storedQuantityValue)
          : 0;

      return {
        productPresentationId: option.referencePresentationId,
        baseSku: option.baseSku,
        presentationSku: option.referencePresentationSku,
        amountInBaseUnits: option.referencePresentationBaseAmount,
        lineTotalCents: Math.round(unitCostCents * purchaseQuantityValue),
        storedQuantity: formatNumericForDatabase(storedQuantityValue),
        storedUnitCostCents,
      } satisfies ParsedPurchaseItem;
    })
    .filter((value): value is ParsedPurchaseItem => Boolean(value));
}

async function parseSaleItems(formData: FormData) {
  const presentationIds = formData
    .getAll("linePresentationId")
    .map((value) => readString(value));
  const quantities = formData.getAll("lineQuantity").map((value) => readString(value));
  const unitPrices = formData.getAll("lineUnitPrice").map((value) => readString(value));
  const presentationOptions = await getAdminPresentationOptions();

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
        baseSku: "",
        presentationSku: "",
        amountInBaseUnits: 0,
        quantity: formatNumericForDatabase(normalizedQuantity),
        quantityValue: normalizedQuantity,
        unitPriceCents,
        lineTotalCents: Math.round(unitPriceCents * normalizedQuantity),
      } satisfies ParsedSaleItem;
    })
    .filter((value): value is ParsedSaleItem => Boolean(value))
    .map((item) => {
      const option = presentationOptions.find(
        (presentation) => presentation.id === item.productPresentationId,
      );

      return {
        ...item,
        baseSku: option?.baseSku ?? "",
        presentationSku: option?.presentationSku ?? "",
        amountInBaseUnits: option?.amountInBaseUnits ?? 0,
      };
    });
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

function parseMovementQuantity(value: string, allowZero: boolean) {
  const normalized = normalizeDecimalInput(value);
  const amount = Number.parseFloat(normalized);

  if (!Number.isFinite(amount)) {
    throw new Error(`Cantidad inválida: ${value}`);
  }

  if (allowZero ? amount < 0 : amount <= 0) {
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
