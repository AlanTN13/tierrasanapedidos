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
type InventorySummaryRow = Database["public"]["Views"]["inventory_summary_by_presentation"]["Row"];
type SaleRowCompat = Omit<SaleRow, "sale_number"> & {
  sale_number?: number | null;
};

export type AdminPresentationOption = {
  id: string;
  productId: string;
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
  productName: string;
  productSlug: string;
  measurementKind: PresentationMeasurementKind;
  purchaseUnitLabel: "kg" | "l" | "unidades";
  purchaseUnitBaseAmount: number;
  referencePresentationId: string;
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
  productName: string;
  measurementKind: PresentationMeasurementKind;
  quantityPurchased: number;
  quantitySold: number;
  stockCurrent: number;
  stockCurrentLabel: string;
  lowStockThreshold: number;
  lowStockThresholdLabel: string;
  isLowStock: boolean;
  isNegativeStock: boolean;
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
  productName: string;
  measurementKind: PresentationMeasurementKind;
  quantityPurchased: number;
  quantitySold: number;
  stockCurrent: number;
  stockCurrentLabel: string;
  lowStockThreshold: number;
  lowStockThresholdLabel: string;
  isLowStock: boolean;
  isNegativeStock: boolean;
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

function resolveLowStockThreshold(
  amountsInBaseUnits: number[],
  fallbackMeasurementKind: PresentationMeasurementKind,
) {
  const finiteAmounts = amountsInBaseUnits.filter((value) => Number.isFinite(value) && value > 0);
  const threshold =
    finiteAmounts.length > 0
      ? Math.min(...finiteAmounts)
      : fallbackMeasurementKind === "unit"
        ? LOW_STOCK_THRESHOLD
        : 0;

  return threshold;
}

function buildProductInventorySummary(
  products: Awaited<ReturnType<typeof getAdminProducts>>,
  inventoryRows: InventorySummaryRow[],
) {
  const inventoryByPresentationId = new Map(
    inventoryRows.map((row) => [row.product_presentation_id, row]),
  );

  return products.map((product) => {
    const activePresentations = product.presentations.filter((presentation) => presentation.id);
    const measurementKind = resolvePrimaryMeasurementKind(
      activePresentations.map((presentation) => presentation.measurementKind),
    );
    const lowStockThreshold = resolveLowStockThreshold(
      activePresentations.map((presentation) => presentation.amountInBaseUnits),
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

    return {
      productId: product.uuid,
      productName: product.name,
      measurementKind,
      quantityPurchased: totals.quantityPurchased,
      quantitySold: totals.quantitySold,
      stockCurrent,
      stockCurrentLabel: formatBaseQuantity(stockCurrent, measurementKind),
      lowStockThreshold,
      lowStockThresholdLabel: formatBaseQuantity(lowStockThreshold, measurementKind),
      isLowStock: stockCurrent <= lowStockThreshold,
      isNegativeStock: stockCurrent < 0,
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

export async function getAdminPresentationOptions() {
  const [products, inventoryRows] = await Promise.all([
    getAdminProducts(),
    getSafeRawInventorySummary(),
  ]);
  const productInventorySummary = buildProductInventorySummary(products, inventoryRows);
  const productInventoryByProductId = new Map(
    productInventorySummary.map((item) => [item.productId, item]),
  );
  const inventoryByPresentationId = new Map(
    inventoryRows.map((row) => [row.product_presentation_id, row]),
  );

  return products
    .flatMap((product) =>
      product.presentations
        .filter((presentation) => presentation.id)
        .map((presentation) => {
          const inventory = inventoryByPresentationId.get(presentation.id!);
          const productInventory = productInventoryByProductId.get(product.uuid);
          const stockCurrentBaseUnits = productInventory?.stockCurrent ?? 0;

          return {
            id: presentation.id!,
            productId: product.uuid,
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
            displayName: `${product.name} - ${presentation.etiqueta}`,
          } satisfies AdminPresentationOption;
        }),
    )
    .sort((a, b) => a.displayName.localeCompare(b.displayName, "es"));
}

export async function getAdminPurchaseProductOptions() {
  const [products, inventoryRows, latestCostByProductId] = await Promise.all([
    getAdminProducts(),
    getSafeRawInventorySummary(),
    getLatestPurchaseUnitCostByProductId(),
  ]);
  const productInventorySummary = buildProductInventorySummary(products, inventoryRows);
  const productInventoryByProductId = new Map(
    productInventorySummary.map((item) => [item.productId, item]),
  );

  return products
    .map((product) => {
      const activePresentations = product.presentations
        .filter((presentation) => presentation.id)
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
        productName: product.name,
        productSlug: product.slug,
        measurementKind: primaryMeasurementKind,
        purchaseUnitLabel,
        purchaseUnitBaseAmount,
        referencePresentationId: referencePresentation.id,
        referencePresentationLabel: referencePresentation.etiqueta,
        referencePresentationBaseAmount: referencePresentation.amountInBaseUnits,
        stockCurrentBaseUnits: productInventory?.stockCurrent ?? 0,
        stockCurrentBaseLabel: productInventory?.stockCurrentLabel ?? "0 unidades",
        lastPurchaseUnitCostCents: latestCostByProductId.get(product.uuid) ?? null,
        displayName: product.name,
      } satisfies AdminPurchaseProductOption;
    })
    .filter((value): value is AdminPurchaseProductOption => Boolean(value))
    .sort((a, b) => a.displayName.localeCompare(b.displayName, "es"));
}

function mapPurchaseOrders(
  orders: PurchaseOrderRow[],
  items: PurchaseOrderItemRow[],
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
  items: SaleItemRow[],
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

export async function getInventorySummary() {
  const [products, rows] = await Promise.all([
    getAdminProducts(),
    getSafeRawInventorySummary(),
  ]);
  return buildProductInventorySummary(products, rows)
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
    supabase
      .from("purchase_order_items")
      .select("id, purchase_order_id, product_presentation_id, quantity, unit_cost_cents, line_total_cents, created_at"),
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
    supabase
      .from("sale_items")
      .select("id, sale_id, product_presentation_id, quantity, unit_price_cents, unit_cost_snapshot_cents, line_total_cents, line_margin_cents, created_at"),
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

async function getLatestPurchaseUnitCostByProductId() {
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
