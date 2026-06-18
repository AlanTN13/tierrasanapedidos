import { Suspense } from "react";
import { connection } from "next/server";
import { PageHeader } from "@/components/admin/page-header";
import { StockMovementsPanel } from "@/components/admin/stock-movements-panel";
import {
  getAdminPresentationOptions,
  getAdminPurchaseProductOptions,
  getStockMovementDashboardMetrics,
  getStockMovements,
} from "@/lib/admin-operations";
import { requireAdminUser } from "@/lib/supabase/admin";

export default function StockMovementsPage() {
  return (
    <Suspense fallback={<StockMovementsPageFallback />}>
      <StockMovementsPageContent />
    </Suspense>
  );
}

async function StockMovementsPageContent() {
  await connection();
  await requireAdminUser();
  const [movements, dashboardMetrics, productOptions, presentationOptions] = await Promise.all([
    getStockMovements(),
    getStockMovementDashboardMetrics(),
    getAdminPurchaseProductOptions(),
    getAdminPresentationOptions(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Movimientos de stock"
        description="Registrá ajustes manuales con trazabilidad para corregir diferencias físicas, mermas, roturas, devoluciones y otros desvíos."
      />
      <StockMovementsPanel
        dashboardMetrics={dashboardMetrics}
        movements={movements}
        productOptions={productOptions}
        presentationOptions={presentationOptions}
      />
    </div>
  );
}

function StockMovementsPageFallback() {
  return (
    <div>
      <span className="section-kicker">Backoffice</span>
      <h1 className="mt-3 font-display text-4xl font-semibold text-olive-dark">
        Movimientos de stock
      </h1>
      <p className="mt-2 text-sm leading-6 text-foreground/66">
        Cargando movimientos...
      </p>
    </div>
  );
}
