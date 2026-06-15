import "server-only";

import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminProducts } from "@/lib/catalog-data";
import type { Database } from "@/types/database";

type PurchaseOrderRow = Database["public"]["Tables"]["purchase_orders"]["Row"];
type PurchaseOrderItemRow = Database["public"]["Tables"]["purchase_order_items"]["Row"];
type SaleRow = Database["public"]["Tables"]["sales"]["Row"];
type SaleItemRow = Database["public"]["Tables"]["sale_items"]["Row"];
type InventorySummaryRow = Database["public"]["Views"]["inventory_summary_by_presentation"]["Row"];

export type AdminPresentationOption = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  presentationLabel: string;
  salePriceCents: number;
  isActive: boolean;
  stockCurrent: number;
  lastUnitCostCents: number | null;
  displayName: string;
};

export type PurchaseOrderItemRecord = {
  id: string;
  productPresentationId: string;
  productName: string;
  presentationLabel: string;
  quantity: number;
  unitCostCents: number;
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
  productName: string;
  presentationLabel: string;
  quantity: number;
  unitPriceCents: number;
  unitCostSnapshotCents: number;
  lineTotalCents: number;
  lineMarginCents: number;
  stockCurrent: number;
  hasNegativeStock: boolean;
};

export type SaleRecord = {
  id: string;
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
  productPresentationId: string;
  productName: string;
  presentationLabel: string;
  quantityPurchased: number;
  quantitySold: number;
  stockCurrent: number;
  lastUnitCostCents: number | null;
  revenueCents: number;
  costCents: number;
  marginCents: number;
  salePriceCents: number;
  isLowStock: boolean;
  isNegativeStock: boolean;
};

export type AdminDashboardMetrics = {
  periodDays: number;
  purchasesTotalCents: number;
  salesTotalCents: number;
  salesMarginCents: number;
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

function parseIntegerAmount(value: string | number | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (!value) {
    return 0;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
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

export async function getAdminPresentationOptions() {
  const [products, inventoryRows] = await Promise.all([
    getAdminProducts(),
    getRawInventorySummary().catch(() => [] as InventorySummaryRow[]),
  ]);
  const inventoryByPresentationId = new Map(
    inventoryRows.map((row) => [row.product_presentation_id, row]),
  );

  return products
    .flatMap((product) =>
      product.presentations
        .filter((presentation) => presentation.id)
        .map((presentation) => {
          const inventory = inventoryByPresentationId.get(presentation.id!);
          return {
            id: presentation.id!,
            productId: product.uuid,
            productName: product.name,
            productSlug: product.slug,
            presentationLabel: presentation.etiqueta,
            salePriceCents: Math.round(presentation.precio * 100),
            isActive: product.isActive && (presentation.activa ?? true),
            stockCurrent: parseNumericQuantity(inventory?.stock_current),
            lastUnitCostCents: inventory?.last_unit_cost_cents ?? null,
            displayName: `${product.name} - ${presentation.etiqueta}`,
          } satisfies AdminPresentationOption;
        }),
    )
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
    const list = itemsByOrderId.get(item.purchase_order_id) ?? [];
    list.push({
      id: item.id,
      productPresentationId: item.product_presentation_id,
      productName: presentation?.productName ?? "Presentación eliminada",
      presentationLabel: presentation?.presentationLabel ?? item.product_presentation_id,
      quantity: parseNumericQuantity(item.quantity),
      unitCostCents: item.unit_cost_cents,
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
  sales: SaleRow[],
  items: SaleItemRow[],
  presentationById: Map<string, AdminPresentationOption>,
  inventoryByPresentationId: Map<string, InventorySummaryRecord>,
) {
  const itemsBySaleId = new Map<string, SaleItemRecord[]>();

  for (const item of items) {
    const presentation = presentationById.get(item.product_presentation_id);
    const inventory = inventoryByPresentationId.get(item.product_presentation_id);
    const stockCurrent = inventory?.stockCurrent ?? 0;
    const list = itemsBySaleId.get(item.sale_id) ?? [];
    list.push({
      id: item.id,
      productPresentationId: item.product_presentation_id,
      productName: presentation?.productName ?? "Presentación eliminada",
      presentationLabel: presentation?.presentationLabel ?? item.product_presentation_id,
      quantity: parseNumericQuantity(item.quantity),
      unitPriceCents: item.unit_price_cents,
      unitCostSnapshotCents: item.unit_cost_snapshot_cents,
      lineTotalCents: item.line_total_cents,
      lineMarginCents: item.line_margin_cents,
      stockCurrent,
      hasNegativeStock: stockCurrent < 0,
    });
    itemsBySaleId.set(item.sale_id, list);
  }

  return sales.map((sale) => {
    const saleItems = (itemsBySaleId.get(sale.id) ?? []).sort((a, b) =>
      a.productName.localeCompare(b.productName, "es"),
    );

    return {
      id: sale.id,
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

export async function getInventorySummary() {
  const [rows, presentationOptions] = await Promise.all([
    getRawInventorySummary(),
    getAdminPresentationOptions(),
  ]);
  const presentationById = mapPresentationLookup(presentationOptions);

  return rows
    .map((row) => {
      const presentation = presentationById.get(row.product_presentation_id);
      const stockCurrent = parseNumericQuantity(row.stock_current);

      return {
        productPresentationId: row.product_presentation_id,
        productName: presentation?.productName ?? "Presentación eliminada",
        presentationLabel: presentation?.presentationLabel ?? row.product_presentation_id,
        quantityPurchased: parseNumericQuantity(row.quantity_purchased),
        quantitySold: parseNumericQuantity(row.quantity_sold),
        stockCurrent,
        lastUnitCostCents: row.last_unit_cost_cents,
        revenueCents: parseIntegerAmount(row.revenue_cents),
        costCents: parseIntegerAmount(row.cost_cents),
        marginCents: parseIntegerAmount(row.margin_cents),
        salePriceCents: presentation?.salePriceCents ?? 0,
        isLowStock: stockCurrent <= LOW_STOCK_THRESHOLD,
        isNegativeStock: stockCurrent < 0,
      } satisfies InventorySummaryRecord;
    })
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
  const [presentationOptions, inventorySummary] = await Promise.all([
    getAdminPresentationOptions(),
    getInventorySummary(),
  ]);
  const presentationById = mapPresentationLookup(presentationOptions);
  const inventoryByPresentationId = new Map(
    inventorySummary.map((item) => [item.productPresentationId, item]),
  );

  const [salesResult, itemsResult] = await Promise.all([
    supabase
      .from("sales")
      .select("id, sold_at, channel, notes, created_by, created_at, updated_at")
      .order("sold_at", { ascending: false }),
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
    inventoryByPresentationId,
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
  const inventorySummary = await getInventorySummary();

  return new Map(
    inventorySummary.map((item) => [item.productPresentationId, item.lastUnitCostCents ?? 0]),
  );
}
