import "server-only";

import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminProducts } from "@/lib/catalog-data";
import { formatSaleCode } from "@/lib/format";
import type { PresentationMeasurementKind } from "@/lib/presentation";
import type { Database } from "@/types/database";

type PurchaseOrderRow = Database["public"]["Tables"]["purchase_orders"]["Row"];
type PurchaseOrderItemRow = Database["public"]["Tables"]["purchase_order_items"]["Row"];
type SaleRow = Database["public"]["Tables"]["sales"]["Row"];
type SaleItemRow = Database["public"]["Tables"]["sale_items"]["Row"];
type StockMovementRow = Database["public"]["Tables"]["stock_movements"]["Row"];
type InventorySummaryRow = Database["public"]["Views"]["inventory_summary_by_presentation"]["Row"];
type PurchaseOrderItemRowCompat = PurchaseOrderItemRow | (
  Omit<
    PurchaseOrderItemRow,
    "base_sku_snapshot" | "presentation_sku_snapshot" | "amount_in_base_units_snapshot"
  > & {
    base_sku_snapshot?: string | null;
    presentation_sku_snapshot?: string | null;
    amount_in_base_units_snapshot?: string | null;
  }
);
type SaleItemRowCompat = SaleItemRow | (
  Omit<SaleItemRow, "base_sku_snapshot" | "presentation_sku_snapshot" | "amount_in_base_units_snapshot"> & {
    base_sku_snapshot?: string | null;
    presentation_sku_snapshot?: string | null;
    amount_in_base_units_snapshot?: string | null;
  }
);
type SaleRowCompat = Omit<SaleRow, "sale_number"> & {
  sale_number?: number | null;
};

export type AdminPresentationOption = {
  id: string;
  productId: string;
  baseSku: string;
  presentationSku: string;
  productName: string;
  productSlug: string;
  presentationLabel: string;
  measurementKind: PresentationMeasurementKind;
  amountInBaseUnits: number;
  salePriceCents: number;
  isActive: boolean;
  stockCurrent: number;
  stockCurrentBaseUnits: number;
  stockCurrentBaseLabel: string;
  stockEquivalentQuantity: number;
  lastUnitCostCents: number | null;
  displayName: string;
};

export type AdminPurchaseProductOption = {
  id: string;
  productId: string;
  baseSku: string;
  productName: string;
  productSlug: string;
  measurementKind: PresentationMeasurementKind;
  purchaseUnitLabel: "kg" | "l" | "unidades";
  purchaseUnitBaseAmount: number;
  referencePresentationId: string;
  referencePresentationSku: string;
  referencePresentationLabel: string;
  referencePresentationBaseAmount: number;
  stockCurrentBaseUnits: number;
  stockCurrentBaseLabel: string;
  lastPurchaseUnitCostCents: number | null;
  displayName: string;
};

export type PurchaseOrderItemRecord = {
  id: string;
  productPresentationId: string;
  baseSku: string;
  presentationSku: string;
  productName: string;
  presentationLabel: string;
  quantity: number;
  quantityLabel: string;
  unitCostCents: number;
  unitCostLabel: string;
  lineTotalCents: number;
};

export type PurchaseOrderRecord = {
  id: string;
  supplierName: string;
  referenceNumber: string | null;
  purchasedAt: string;
  notes: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  totalCents: number;
  itemCount: number;
  items: PurchaseOrderItemRecord[];
};

export type SaleItemRecord = {
  id: string;
  productPresentationId: string;
  productId: string;
  baseSku: string;
  presentationSku: string;
  productName: string;
  presentationLabel: string;
  quantity: number;
  unitPriceCents: number;
  unitCostSnapshotCents: number;
  lineTotalCents: number;
  lineMarginCents: number;
  stockCurrent: number;
  stockCurrentBaseUnits: number;
  stockCurrentBaseLabel: string;
  hasNegativeStock: boolean;
  usesEstimatedCost: boolean;
};

export type SaleRecord = {
  id: string;
  saleNumber: number | null;
  saleCode: string;
  soldAt: string;
  channel: string;
  notes: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  totalCents: number;
  totalMarginCents: number;
  itemCount: number;
  hasNegativeStock: boolean;
  items: SaleItemRecord[];
};

export type InventorySummaryRecord = {
  productId: string;
  baseSku: string;
  productName: string;
  measurementKind: PresentationMeasurementKind;
  quantityPurchased: number;
  quantitySold: number;
  stockCurrent: number;
  stockCurrentLabel: string;
  stockBaseUnits: number;
  stockBaseLabel: string;
  lowStockThreshold: number;
  lowStockThresholdLabel: string;
  smallestPresentationBaseUnits: number;
  smallestPresentationLabel: string;
  smallestPresentationSku: string;
  isLowStock: boolean;
  isNegativeStock: boolean;
};

export type StockMovementType = "entry" | "exit" | "set";

export type StockMovementRecord = {
  id: string;
  productId: string;
  productName: string;
  presentationId: string | null;
  presentationLabel: string | null;
  movementType: StockMovementType;
  quantity: number;
  quantityLabel: string;
  quantityBaseUnits: number;
  quantityBaseLabel: string;
  previousStock: number;
  previousStockLabel: string;
  newStock: number;
  newStockLabel: string;
  reason: string;
  notes: string | null;
  createdBy: string;
  createdByEmail: string;
  createdAt: string;
};

export type StockMovementDashboardMetrics = {
  movementsToday: number;
  manualEntriesToday: number;
  manualExitsToday: number;
  productsAffectedToday: number;
};

export type AdminDashboardMetrics = {
  periodDays: number;
  purchasesTotalCents: number;
  salesTotalCents: number;
  salesMarginCents: number;
  salesCount: number;
  stockLowCount: number;
  topRotationProducts: Array<{
    productPresentationId: string;
    name: string;
    quantitySold: number;
  }>;
  recentPurchases: PurchaseOrderRecord[];
  recentSales: SaleRecord[];
};

const LOW_STOCK_THRESHOLD = 3;
const DASHBOARD_PERIOD_DAYS = 30;
const DASHBOARD_RECENT_LIMIT = 5;

function isMissingRelationError(message: string) {
  const normalized = message.toLowerCase();

  return (
    normalized.includes("schema cache") ||
    normalized.includes("could not find the table") ||
    normalized.includes("does not exist") ||
    normalized.includes("could not find the relation")
  );
}

function parseNumericQuantity(value: string | number | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (!value) {
    return 0;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatBaseQuantity(
  value: number,
  measurementKind: PresentationMeasurementKind,
) {
  if (measurementKind === "unit") {
    const suffix = value === 1 ? "unidad" : "unidades";
    return `${formatQuantityValue(value)} ${suffix}`;
  }

  const useLargeUnit = Math.abs(value) >= 1000;
  const normalizedValue = useLargeUnit ? value / 1000 : value;
  const unit =
    measurementKind === "weight"
      ? useLargeUnit
        ? "kg"
        : "g"
      : useLargeUnit
        ? "l"
        : "ml";

  return `${formatQuantityValue(normalizedValue)}${unit}`;
}

function getBaseUnitLabel(measurementKind: PresentationMeasurementKind) {
  if (measurementKind === "weight") {
    return "g";
  }

  if (measurementKind === "volume") {
    return "ml";
  }

  return "unidades";
}

function getPurchaseUnitConfig(measurementKind: PresentationMeasurementKind) {
  if (measurementKind === "weight") {
    return {
      purchaseUnitLabel: "kg" as const,
      purchaseUnitBaseAmount: 1000,
    };
  }

  if (measurementKind === "volume") {
    return {
      purchaseUnitLabel: "l" as const,
      purchaseUnitBaseAmount: 1000,
    };
  }

  return {
    purchaseUnitLabel: "unidades" as const,
    purchaseUnitBaseAmount: 1,
  };
}

function formatQuantityValue(value: number) {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 3,
  }).format(value);
}

type ProductInventoryAggregate = {
  productId: string;
  baseSku: string;
  productName: string;
  measurementKind: PresentationMeasurementKind;
  quantityPurchased: number;
  quantitySold: number;
  stockCurrent: number;
  stockCurrentLabel: string;
  stockBaseUnits: number;
  stockBaseLabel: string;
  lowStockThreshold: number;
  lowStockThresholdLabel: string;
  smallestPresentationBaseUnits: number;
  smallestPresentationLabel: string;
  smallestPresentationSku: string;
  isLowStock: boolean;
  isNegativeStock: boolean;
};

type ProductMeasurementMeta = {
  productId: string;
  baseSku: string;
  productName: string;
  measurementKind: PresentationMeasurementKind;
};

function resolvePrimaryMeasurementKind(
  kinds: PresentationMeasurementKind[],
): PresentationMeasurementKind {
  if (kinds.includes("weight")) {
    return "weight";
  }

  if (kinds.includes("volume")) {
    return "volume";
  }

  return "unit";
}

function resolveSmallestPresentation(
  presentations: Awaited<ReturnType<typeof getAdminProducts>>[number]["presentations"],
  fallbackMeasurementKind: PresentationMeasurementKind,
) {
  const activePresentations = presentations
    .filter((presentation) => (presentation.activa ?? true) && presentation.id)
    .filter((presentation) => Number.isFinite(presentation.amountInBaseUnits) && presentation.amountInBaseUnits > 0)
    .sort((a, b) => a.amountInBaseUnits - b.amountInBaseUnits);
  const smallestPresentation = activePresentations[0];
  const threshold =
    smallestPresentation?.amountInBaseUnits ??
    (fallbackMeasurementKind === "unit" ? LOW_STOCK_THRESHOLD : 0);

  return {
    smallestPresentationBaseUnits: threshold,
    smallestPresentationLabel: smallestPresentation?.etiqueta ?? formatBaseQuantity(threshold, fallbackMeasurementKind),
    smallestPresentationSku: smallestPresentation?.sku ?? "",
  };
}

function getProductMeasurementMeta(
  products: Awaited<ReturnType<typeof getAdminProducts>>,
) {
  return new Map(
    products.map((product) => {
      const activePresentations = product.presentations.filter(
        (presentation) => presentation.id && (presentation.activa ?? true),
      );
      const measurementKind = resolvePrimaryMeasurementKind(
        activePresentations.map((presentation) => presentation.measurementKind),
      );

      return [
        product.uuid,
        {
          productId: product.uuid,
          baseSku: product.baseSku,
          productName: product.name,
          measurementKind,
        } satisfies ProductMeasurementMeta,
      ] as const;
    }),
  );
}

function buildProductInventorySummary(
  products: Awaited<ReturnType<typeof getAdminProducts>>,
  inventoryRows: InventorySummaryRow[],
  manualMovementBaseUnitsByProductId: Map<string, number>,
) {
  const inventoryByPresentationId = new Map(
    inventoryRows.map((row) => [row.product_presentation_id, row]),
  );

  return products.map((product) => {
    const activePresentations = product.presentations.filter(
      (presentation) => presentation.id && (presentation.activa ?? true),
    );
    const measurementKind = resolvePrimaryMeasurementKind(
      activePresentations.map((presentation) => presentation.measurementKind),
    );
    const smallestPresentation = resolveSmallestPresentation(
      product.presentations,
      measurementKind,
    );

    const totals = activePresentations.reduce(
      (summary, presentation) => {
        const row = inventoryByPresentationId.get(presentation.id!);
        const purchased = parseNumericQuantity(row?.quantity_purchased) * presentation.amountInBaseUnits;
        const sold = parseNumericQuantity(row?.quantity_sold) * presentation.amountInBaseUnits;

        return {
          quantityPurchased: summary.quantityPurchased + purchased,
          quantitySold: summary.quantitySold + sold,
        };
      },
      {
        quantityPurchased: 0,
        quantitySold: 0,
      },
    );

    const stockCurrent = totals.quantityPurchased - totals.quantitySold;
    const manualAdjustment = manualMovementBaseUnitsByProductId.get(product.uuid) ?? 0;
    const stockCurrentWithAdjustments = stockCurrent + manualAdjustment;

    return {
      productId: product.uuid,
      baseSku: product.baseSku,
      productName: product.name,
      measurementKind,
      quantityPurchased: totals.quantityPurchased,
      quantitySold: totals.quantitySold,
      stockCurrent: stockCurrentWithAdjustments,
      stockCurrentLabel: formatBaseQuantity(stockCurrentWithAdjustments, measurementKind),
      stockBaseUnits: stockCurrentWithAdjustments,
      stockBaseLabel: formatBaseQuantity(stockCurrentWithAdjustments, measurementKind),
      lowStockThreshold: smallestPresentation.smallestPresentationBaseUnits,
      lowStockThresholdLabel: formatBaseQuantity(
        smallestPresentation.smallestPresentationBaseUnits,
        measurementKind,
      ),
      smallestPresentationBaseUnits: smallestPresentation.smallestPresentationBaseUnits,
      smallestPresentationLabel: smallestPresentation.smallestPresentationLabel,
      smallestPresentationSku: smallestPresentation.smallestPresentationSku,
      isLowStock: stockCurrentWithAdjustments <= smallestPresentation.smallestPresentationBaseUnits,
      isNegativeStock: stockCurrentWithAdjustments < 0,
    } satisfies ProductInventoryAggregate;
  });
}

function mapPresentationLookup(options: AdminPresentationOption[]) {
  return new Map(options.map((option) => [option.id, option]));
}

async function getRawInventorySummary() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("inventory_summary_by_presentation")
    .select(
      "product_presentation_id, quantity_purchased, quantity_sold, stock_current, last_unit_cost_cents, revenue_cents, cost_cents, margin_cents",
    );

  if (error && isMissingRelationError(error.message)) {
    return [];
  }

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

async function getSafeRawInventorySummary() {
  return getRawInventorySummary().catch(() => [] as InventorySummaryRow[]);
}

async function getRawStockMovements() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("stock_movements")
    .select(
      "id, product_id, presentation_id, movement_type, quantity, quantity_base_units, previous_stock, new_stock, reason, notes, created_by, created_at",
    )
    .order("created_at", { ascending: false });

  if (error && isMissingRelationError(error.message)) {
    return [];
  }

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

async function getSafeRawStockMovements() {
  return getRawStockMovements().catch(() => [] as StockMovementRow[]);
}

function aggregateManualMovementBaseUnitsByProduct(
  rows: StockMovementRow[],
) {
  const movementByProductId = new Map<string, number>();

  for (const row of rows) {
    const current = movementByProductId.get(row.product_id) ?? 0;
    movementByProductId.set(
      row.product_id,
      current + parseNumericQuantity(row.quantity_base_units),
    );
  }

  return movementByProductId;
}

export async function getAdminPresentationOptions() {
  const [products, inventoryRows, stockMovementRows] = await Promise.all([
    getAdminProducts(),
    getSafeRawInventorySummary(),
    getSafeRawStockMovements(),
  ]);
  const productInventorySummary = buildProductInventorySummary(
    products,
    inventoryRows,
    aggregateManualMovementBaseUnitsByProduct(stockMovementRows),
  );
  const productInventoryByProductId = new Map(
    productInventorySummary.map((item) => [item.productId, item]),
  );
  const inventoryByPresentationId = new Map(
    inventoryRows.map((row) => [row.product_presentation_id, row]),
  );

  return products
    .flatMap((product) =>
      product.presentations
        .filter((presentation) => presentation.id && (presentation.activa ?? true))
        .map((presentation) => {
          const inventory = inventoryByPresentationId.get(presentation.id!);
          const productInventory = productInventoryByProductId.get(product.uuid);
          const stockCurrentBaseUnits = productInventory?.stockCurrent ?? 0;

          return {
            id: presentation.id!,
            productId: product.uuid,
            baseSku: product.baseSku,
            presentationSku: presentation.sku ?? "",
            productName: product.name,
            productSlug: product.slug,
            presentationLabel: presentation.etiqueta,
            measurementKind: presentation.measurementKind,
            amountInBaseUnits: presentation.amountInBaseUnits,
            salePriceCents: Math.round(presentation.precio * 100),
            isActive: product.isActive && (presentation.activa ?? true),
            stockCurrent:
              presentation.amountInBaseUnits > 0
                ? stockCurrentBaseUnits / presentation.amountInBaseUnits
                : 0,
            stockCurrentBaseUnits,
            stockCurrentBaseLabel: productInventory?.stockCurrentLabel ?? "0 unidades",
            stockEquivalentQuantity:
              presentation.amountInBaseUnits > 0
                ? stockCurrentBaseUnits / presentation.amountInBaseUnits
                : 0,
            lastUnitCostCents: inventory?.last_unit_cost_cents ?? null,
            displayName: `${product.name} · ${presentation.etiqueta} · ${presentation.sku ?? ""}`,
          } satisfies AdminPresentationOption;
        }),
    )
    .sort((a, b) => a.displayName.localeCompare(b.displayName, "es"));
}

export async function getAdminPurchaseProductOptions() {
  const [products, inventoryRows, latestCostByProductId, stockMovementRows] = await Promise.all([
    getAdminProducts(),
    getSafeRawInventorySummary(),
    getLatestPurchaseUnitCostByProductId(),
    getSafeRawStockMovements(),
  ]);
  const productInventorySummary = buildProductInventorySummary(
    products,
    inventoryRows,
    aggregateManualMovementBaseUnitsByProduct(stockMovementRows),
  );
  const productInventoryByProductId = new Map(
    productInventorySummary.map((item) => [item.productId, item]),
  );

  return products
    .map((product) => {
      const activePresentations = product.presentations
        .filter((presentation) => presentation.id && (presentation.activa ?? true))
        .sort((a, b) => a.amountInBaseUnits - b.amountInBaseUnits);
      const primaryMeasurementKind = resolvePrimaryMeasurementKind(
        activePresentations.map((presentation) => presentation.measurementKind),
      );
      const referencePresentation =
        activePresentations.find(
          (presentation) => presentation.measurementKind === primaryMeasurementKind,
        ) ?? activePresentations[0];

      if (!referencePresentation?.id) {
        return null;
      }

      const productInventory = productInventoryByProductId.get(product.uuid);
      const { purchaseUnitLabel, purchaseUnitBaseAmount } = getPurchaseUnitConfig(
        primaryMeasurementKind,
      );

      return {
        id: product.uuid,
        productId: product.uuid,
        baseSku: product.baseSku,
        productName: product.name,
        productSlug: product.slug,
        measurementKind: primaryMeasurementKind,
        purchaseUnitLabel,
        purchaseUnitBaseAmount,
        referencePresentationId: referencePresentation.id,
        referencePresentationSku: referencePresentation.sku ?? "",
        referencePresentationLabel: referencePresentation.etiqueta,
        referencePresentationBaseAmount: referencePresentation.amountInBaseUnits,
        stockCurrentBaseUnits: productInventory?.stockCurrent ?? 0,
        stockCurrentBaseLabel: productInventory?.stockCurrentLabel ?? "0 unidades",
        lastPurchaseUnitCostCents: latestCostByProductId.get(product.uuid) ?? null,
        displayName: `${product.name} · ${product.baseSku}`,
      } satisfies AdminPurchaseProductOption;
    })
    .filter((value): value is AdminPurchaseProductOption => Boolean(value))
    .sort((a, b) => a.displayName.localeCompare(b.displayName, "es"));
}

function mapPurchaseOrders(
  orders: PurchaseOrderRow[],
  items: PurchaseOrderItemRowCompat[],
  presentationById: Map<string, AdminPresentationOption>,
) {
  const itemsByOrderId = new Map<string, PurchaseOrderItemRecord[]>();

  for (const item of items) {
    const presentation = presentationById.get(item.product_presentation_id);
    const measurementKind = presentation?.measurementKind ?? "unit";
    const quantityBaseUnits =
      parseNumericQuantity(item.quantity) * (presentation?.amountInBaseUnits ?? 1);
    const purchaseUnit = getPurchaseUnitConfig(measurementKind);
    const purchaseQuantity = quantityBaseUnits / purchaseUnit.purchaseUnitBaseAmount;
    const list = itemsByOrderId.get(item.purchase_order_id) ?? [];
    list.push({
      id: item.id,
      productPresentationId: item.product_presentation_id,
      baseSku: item.base_sku_snapshot ?? presentation?.baseSku ?? "",
      presentationSku: item.presentation_sku_snapshot ?? presentation?.presentationSku ?? "",
      productName: presentation?.productName ?? "Presentación eliminada",
      presentationLabel: presentation?.presentationLabel ?? item.product_presentation_id,
      quantity: purchaseQuantity,
      quantityLabel: `${formatQuantityValue(purchaseQuantity)} ${purchaseUnit.purchaseUnitLabel}`,
      unitCostCents: item.unit_cost_cents,
      unitCostLabel:
        purchaseQuantity > 0
          ? `${formatCurrencyFromCents(item.line_total_cents / purchaseQuantity)} / ${purchaseUnit.purchaseUnitLabel}`
          : `${formatCurrencyFromCents(0)} / ${purchaseUnit.purchaseUnitLabel}`,
      lineTotalCents: item.line_total_cents,
    });
    itemsByOrderId.set(item.purchase_order_id, list);
  }

  return orders.map((order) => {
    const orderItems = (itemsByOrderId.get(order.id) ?? []).sort((a, b) =>
      a.productName.localeCompare(b.productName, "es"),
    );

    return {
      id: order.id,
      supplierName: order.supplier_name,
      referenceNumber: order.reference_number,
      purchasedAt: order.purchased_at,
      notes: order.notes,
      createdBy: order.created_by,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      totalCents: orderItems.reduce((sum, item) => sum + item.lineTotalCents, 0),
      itemCount: orderItems.length,
      items: orderItems,
    } satisfies PurchaseOrderRecord;
  });
}

function mapSales(
  sales: SaleRowCompat[],
  items: SaleItemRowCompat[],
  presentationById: Map<string, AdminPresentationOption>,
  inventoryByProductId: Map<string, InventorySummaryRecord>,
  latestCostByPresentationId: Map<string, number>,
) {
  const itemsBySaleId = new Map<string, SaleItemRecord[]>();

  for (const item of items) {
    const presentation = presentationById.get(item.product_presentation_id);
    const inventory = presentation
      ? inventoryByProductId.get(presentation.productId)
      : undefined;
    const stockCurrentBaseUnits = inventory?.stockCurrent ?? 0;
    const quantity = parseNumericQuantity(item.quantity);
    const fallbackUnitCostCents =
      latestCostByPresentationId.get(item.product_presentation_id) ??
      presentation?.lastUnitCostCents ??
      0;
    const usesEstimatedCost = item.unit_cost_snapshot_cents <= 0 && fallbackUnitCostCents > 0;
    const effectiveUnitCostCents = usesEstimatedCost
      ? fallbackUnitCostCents
      : item.unit_cost_snapshot_cents;
    const effectiveLineMarginCents = usesEstimatedCost
      ? item.line_total_cents - Math.round(effectiveUnitCostCents * quantity)
      : item.line_margin_cents;
    const list = itemsBySaleId.get(item.sale_id) ?? [];
    list.push({
      id: item.id,
      productPresentationId: item.product_presentation_id,
      productId: presentation?.productId ?? "",
      baseSku: item.base_sku_snapshot ?? presentation?.baseSku ?? "",
      presentationSku: item.presentation_sku_snapshot ?? presentation?.presentationSku ?? "",
      productName: presentation?.productName ?? "Presentación eliminada",
      presentationLabel: presentation?.presentationLabel ?? item.product_presentation_id,
      quantity,
      unitPriceCents: item.unit_price_cents,
      unitCostSnapshotCents: effectiveUnitCostCents,
      lineTotalCents: item.line_total_cents,
      lineMarginCents: effectiveLineMarginCents,
      stockCurrent:
        presentation && presentation.amountInBaseUnits > 0
          ? stockCurrentBaseUnits / presentation.amountInBaseUnits
          : 0,
      stockCurrentBaseUnits,
      stockCurrentBaseLabel: inventory?.stockCurrentLabel ?? "0 unidades",
      hasNegativeStock: (inventory?.stockCurrent ?? 0) < 0,
      usesEstimatedCost,
    });
    itemsBySaleId.set(item.sale_id, list);
  }

  return sales.map((sale) => {
    const saleItems = (itemsBySaleId.get(sale.id) ?? []).sort((a, b) =>
      a.productName.localeCompare(b.productName, "es"),
    );

    return {
      id: sale.id,
      saleNumber: sale.sale_number ?? null,
      saleCode: formatSaleCode(sale.sale_number, sale.id),
      soldAt: sale.sold_at,
      channel: sale.channel,
      notes: sale.notes,
      createdBy: sale.created_by,
      createdAt: sale.created_at,
      updatedAt: sale.updated_at,
      totalCents: saleItems.reduce((sum, item) => sum + item.lineTotalCents, 0),
      totalMarginCents: saleItems.reduce((sum, item) => sum + item.lineMarginCents, 0),
      itemCount: saleItems.length,
      hasNegativeStock: saleItems.some((item) => item.hasNegativeStock),
      items: saleItems,
    } satisfies SaleRecord;
  });
}

async function fetchSalesRows(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const selectWithNumber =
    "id, sale_number, sold_at, channel, notes, created_by, created_at, updated_at";
  const legacySelect = "id, sold_at, channel, notes, created_by, created_at, updated_at";

  const result = await supabase
    .from("sales")
    .select(selectWithNumber)
    .order("sold_at", { ascending: false });

  if (!result.error || !isMissingRelationError(result.error.message)) {
    return result;
  }

  return supabase
    .from("sales")
    .select(legacySelect)
    .order("sold_at", { ascending: false });
}

async function fetchPurchaseOrderItemRows(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
) {
  const selectWithSnapshots =
    "id, purchase_order_id, product_presentation_id, base_sku_snapshot, presentation_sku_snapshot, amount_in_base_units_snapshot, quantity, unit_cost_cents, line_total_cents, created_at";
  const legacySelect =
    "id, purchase_order_id, product_presentation_id, quantity, unit_cost_cents, line_total_cents, created_at";

  const result = await supabase
    .from("purchase_order_items")
    .select(selectWithSnapshots);

  if (!result.error || !isMissingRelationError(result.error.message)) {
    return result;
  }

  return supabase.from("purchase_order_items").select(legacySelect);
}

async function fetchSaleItemRows(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
) {
  const selectWithSnapshots =
    "id, sale_id, product_presentation_id, base_sku_snapshot, presentation_sku_snapshot, amount_in_base_units_snapshot, quantity, unit_price_cents, unit_cost_snapshot_cents, line_total_cents, line_margin_cents, created_at";
  const legacySelect =
    "id, sale_id, product_presentation_id, quantity, unit_price_cents, unit_cost_snapshot_cents, line_total_cents, line_margin_cents, created_at";

  const result = await supabase.from("sale_items").select(selectWithSnapshots);

  if (!result.error || !isMissingRelationError(result.error.message)) {
    return result;
  }

  return supabase.from("sale_items").select(legacySelect);
}

export async function getInventorySummary() {
  const [products, rows, stockMovementRows] = await Promise.all([
    getAdminProducts(),
    getSafeRawInventorySummary(),
    getSafeRawStockMovements(),
  ]);
  return buildProductInventorySummary(
    products,
    rows,
    aggregateManualMovementBaseUnitsByProduct(stockMovementRows),
  )
    .sort((a, b) => {
      if (a.stockCurrent !== b.stockCurrent) {
        return a.stockCurrent - b.stockCurrent;
      }

      return a.productName.localeCompare(b.productName, "es");
    });
}

export async function getPurchaseOrders() {
  const supabase = await createServerSupabaseClient();
  const presentationOptions = await getAdminPresentationOptions();
  const presentationById = mapPresentationLookup(presentationOptions);

  const [ordersResult, itemsResult] = await Promise.all([
    supabase
      .from("purchase_orders")
      .select("id, supplier_name, reference_number, purchased_at, notes, created_by, created_at, updated_at")
      .order("purchased_at", { ascending: false }),
    fetchPurchaseOrderItemRows(supabase),
  ]);

  const relationError = ordersResult.error ?? itemsResult.error;

  if (relationError && isMissingRelationError(relationError.message)) {
    return [];
  }

  if (ordersResult.error || itemsResult.error) {
    throw new Error(ordersResult.error?.message ?? itemsResult.error?.message);
  }

  return mapPurchaseOrders(ordersResult.data ?? [], itemsResult.data ?? [], presentationById);
}

export async function getPurchaseOrderById(id: string) {
  const orders = await getPurchaseOrders();
  return orders.find((order) => order.id === id) ?? null;
}

export async function getSales() {
  const supabase = await createServerSupabaseClient();
  const [presentationOptions, inventorySummary, latestCostByPresentationId] = await Promise.all([
    getAdminPresentationOptions(),
    getInventorySummary(),
    getLatestCostByPresentationId(),
  ]);
  const presentationById = mapPresentationLookup(presentationOptions);
  const inventoryByProductId = new Map(
    inventorySummary.map((item) => [item.productId, item]),
  );

  const [salesResult, itemsResult] = await Promise.all([
    fetchSalesRows(supabase),
    fetchSaleItemRows(supabase),
  ]);

  const relationError = salesResult.error ?? itemsResult.error;

  if (relationError && isMissingRelationError(relationError.message)) {
    return [];
  }

  if (salesResult.error || itemsResult.error) {
    throw new Error(salesResult.error?.message ?? itemsResult.error?.message);
  }

  return mapSales(
    salesResult.data ?? [],
    itemsResult.data ?? [],
    presentationById,
    inventoryByProductId,
    latestCostByPresentationId,
  );
}

export async function getSaleById(id: string) {
  const sales = await getSales();
  return sales.find((sale) => sale.id === id) ?? null;
}

export async function getStockMovements() {
  const [products, stockMovementRows, adminUsersResult] = await Promise.all([
    getAdminProducts(),
    getSafeRawStockMovements(),
    createServerSupabaseClient().then((supabase) =>
      supabase.from("admin_users").select("user_id, email"),
    ),
  ]);

  if (adminUsersResult.error) {
    throw new Error(adminUsersResult.error.message);
  }

  const productById = new Map(products.map((product) => [product.uuid, product]));
  const presentationMetaById = new Map(
    products.flatMap((product) =>
      product.presentations
        .filter((presentation) => presentation.id)
        .map((presentation) => [
          presentation.id!,
          {
            productId: product.uuid,
            presentationLabel: presentation.etiqueta,
            amountInBaseUnits: presentation.amountInBaseUnits,
          },
        ]),
    ),
  );
  const measurementMetaByProductId = getProductMeasurementMeta(products);
  const adminEmailById = new Map(
    (adminUsersResult.data ?? []).map((adminUser) => [adminUser.user_id, adminUser.email]),
  );

  return stockMovementRows.map((row) => {
    const product = productById.get(row.product_id);
    const presentation = row.presentation_id
      ? presentationMetaById.get(row.presentation_id)
      : null;
    const measurementMeta = measurementMetaByProductId.get(row.product_id);
    const measurementKind = measurementMeta?.measurementKind ?? "unit";
    const quantity = parseNumericQuantity(row.quantity);
    const quantityBaseUnits = parseNumericQuantity(row.quantity_base_units);
    const previousStock = parseNumericQuantity(row.previous_stock);
    const newStock = parseNumericQuantity(row.new_stock);
    const baseUnitLabel = getBaseUnitLabel(measurementKind);
    const quantityLabel = presentation
      ? `${formatQuantityValue(quantity)} x ${presentation.presentationLabel}`
      : `${formatQuantityValue(quantity)} ${baseUnitLabel}`;

    return {
      id: row.id,
      productId: row.product_id,
      productName: product?.name ?? measurementMeta?.productName ?? row.product_id,
      presentationId: row.presentation_id,
      presentationLabel: presentation?.presentationLabel ?? null,
      movementType: row.movement_type as StockMovementType,
      quantity,
      quantityLabel,
      quantityBaseUnits,
      quantityBaseLabel: formatBaseQuantity(quantityBaseUnits, measurementKind),
      previousStock,
      previousStockLabel: formatBaseQuantity(previousStock, measurementKind),
      newStock,
      newStockLabel: formatBaseQuantity(newStock, measurementKind),
      reason: row.reason,
      notes: row.notes,
      createdBy: row.created_by,
      createdByEmail: adminEmailById.get(row.created_by) ?? row.created_by,
      createdAt: row.created_at,
    } satisfies StockMovementRecord;
  });
}

export async function getStockMovementDashboardMetrics() {
  const movements = await getStockMovements();
  const todayKey = new Date().toISOString().slice(0, 10);
  const todaysMovements = movements.filter(
    (movement) => movement.createdAt.slice(0, 10) === todayKey,
  );

  return {
    movementsToday: todaysMovements.length,
    manualEntriesToday: todaysMovements.filter((movement) => movement.quantityBaseUnits > 0).length,
    manualExitsToday: todaysMovements.filter((movement) => movement.quantityBaseUnits < 0).length,
    productsAffectedToday: new Set(todaysMovements.map((movement) => movement.productId)).size,
  } satisfies StockMovementDashboardMetrics;
}

export async function getAdminDashboardMetrics(periodDays = DASHBOARD_PERIOD_DAYS) {
  const [purchaseOrders, sales, inventorySummary] = await Promise.all([
    getPurchaseOrders(),
    getSales(),
    getInventorySummary(),
  ]);
  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - periodDays);
  const periodStartTime = periodStart.getTime();

  const purchasesInPeriod = purchaseOrders.filter(
    (order) => new Date(order.purchasedAt).getTime() >= periodStartTime,
  );
  const salesInPeriod = sales.filter(
    (sale) => new Date(sale.soldAt).getTime() >= periodStartTime,
  );

  const topRotationByPresentation = new Map<
    string,
    { name: string; quantitySold: number }
  >();

  for (const sale of salesInPeriod) {
    for (const item of sale.items) {
      const current = topRotationByPresentation.get(item.productPresentationId);
      const nextQuantity = (current?.quantitySold ?? 0) + item.quantity;
      topRotationByPresentation.set(item.productPresentationId, {
        name: `${item.productName} - ${item.presentationLabel}`,
        quantitySold: nextQuantity,
      });
    }
  }

  return {
    periodDays,
    purchasesTotalCents: purchasesInPeriod.reduce((sum, order) => sum + order.totalCents, 0),
    salesTotalCents: salesInPeriod.reduce((sum, sale) => sum + sale.totalCents, 0),
    salesMarginCents: salesInPeriod.reduce((sum, sale) => sum + sale.totalMarginCents, 0),
    salesCount: salesInPeriod.length,
    stockLowCount: inventorySummary.filter((item) => item.isLowStock).length,
    topRotationProducts: [...topRotationByPresentation.entries()]
      .map(([productPresentationId, item]) => ({
        productPresentationId,
        name: item.name,
        quantitySold: item.quantitySold,
      }))
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, DASHBOARD_RECENT_LIMIT),
    recentPurchases: purchaseOrders.slice(0, DASHBOARD_RECENT_LIMIT),
    recentSales: sales.slice(0, DASHBOARD_RECENT_LIMIT),
  } satisfies AdminDashboardMetrics;
}

export async function getLatestCostByPresentationId() {
  const [presentationOptions, latestCostByProductId] = await Promise.all([
    getAdminPresentationOptions(),
    getLatestPurchaseUnitCostByProductId(),
  ]);

  return new Map(
    presentationOptions.map((item) => {
      const unitCostByPurchaseUnit = latestCostByProductId.get(item.productId) ?? 0;
      const purchaseUnitBaseAmount = getPurchaseUnitConfig(item.measurementKind).purchaseUnitBaseAmount;
      const unitCostSnapshotCents =
        purchaseUnitBaseAmount > 0
          ? Math.round((unitCostByPurchaseUnit * item.amountInBaseUnits) / purchaseUnitBaseAmount)
          : 0;

      return [item.id, unitCostSnapshotCents] as const;
    }),
  );
}

export async function getLatestPurchaseUnitCostByProductId() {
  const supabase = await createServerSupabaseClient();
  const [products, ordersResult, itemsResult] = await Promise.all([
    getAdminProducts(),
    supabase
      .from("purchase_orders")
      .select("id, purchased_at")
      .order("purchased_at", { ascending: false }),
    supabase
      .from("purchase_order_items")
      .select("product_presentation_id, purchase_order_id, quantity, line_total_cents, created_at"),
  ]);

  const relationError = ordersResult.error ?? itemsResult.error;

  if (relationError && isMissingRelationError(relationError.message)) {
    return new Map<string, number>();
  }

  if (ordersResult.error || itemsResult.error) {
    throw new Error(ordersResult.error?.message ?? itemsResult.error?.message);
  }

  const orderById = new Map((ordersResult.data ?? []).map((order) => [order.id, order]));
  const presentationMetaById = new Map(
    products.flatMap((product) =>
      product.presentations
        .filter((presentation) => presentation.id)
        .map((presentation) => [
          presentation.id!,
          {
            productId: product.uuid,
            measurementKind: presentation.measurementKind,
            amountInBaseUnits: presentation.amountInBaseUnits,
          },
        ]),
    ),
  );

  const sortedItems = [...(itemsResult.data ?? [])].sort((a, b) => {
    const orderA = orderById.get(a.purchase_order_id);
    const orderB = orderById.get(b.purchase_order_id);
    const timeA = orderA ? new Date(orderA.purchased_at).getTime() : 0;
    const timeB = orderB ? new Date(orderB.purchased_at).getTime() : 0;

    if (timeA !== timeB) {
      return timeB - timeA;
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const latestCostByProductId = new Map<string, number>();

  for (const item of sortedItems) {
    const meta = presentationMetaById.get(item.product_presentation_id);

    if (!meta || latestCostByProductId.has(meta.productId)) {
      continue;
    }

    const quantityStored = parseNumericQuantity(item.quantity);
    const baseUnitsPurchased = quantityStored * meta.amountInBaseUnits;
    const purchaseUnitBaseAmount = getPurchaseUnitConfig(meta.measurementKind).purchaseUnitBaseAmount;
    const purchaseUnitQuantity = baseUnitsPurchased / purchaseUnitBaseAmount;

    if (purchaseUnitQuantity <= 0) {
      continue;
    }

    latestCostByProductId.set(
      meta.productId,
      Math.round(item.line_total_cents / purchaseUnitQuantity),
    );
  }

  return latestCostByProductId;
}

function formatCurrencyFromCents(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value / 100);
}
