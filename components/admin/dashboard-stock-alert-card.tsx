"use client";

import { AlertProductsModal, type AlertProductItem } from "@/components/admin/alert-products-modal";
import type { InventorySummaryRecord } from "@/lib/admin-operations";

type DashboardStockAlertCardProps = {
  inventorySummary: InventorySummaryRecord[];
  value: string;
  description: string;
};

export function DashboardStockAlertCard({
  inventorySummary,
  value,
  description,
}: DashboardStockAlertCardProps) {
  const items: AlertProductItem[] = inventorySummary
    .filter((item) => item.isLowStock)
    .map((item) => ({
      id: item.productId,
      name: item.productName,
      detail: `Stock base actual: ${item.stockCurrentLabel}`,
      note: `Alerta cuando queda igual o menos que ${item.lowStockThresholdLabel}`,
    }));

  return (
    <AlertProductsModal
      label="Stock crítico"
      value={value}
      description={description}
      title="Productos con stock crítico"
      emptyText="No hay productos con stock crítico en este momento."
      items={items}
    />
  );
}
