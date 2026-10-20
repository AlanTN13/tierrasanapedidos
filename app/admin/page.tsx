import { Suspense } from "react";
import { connection } from "next/server";
import { DashboardOverview } from "@/components/admin/dashboard-overview";
import { PageHeader } from "@/components/admin/page-header";
import { getAdminDashboardMetrics, getInventorySummary } from "@/lib/admin-operations";
import { getAdminCategories, getAdminProducts } from "@/lib/catalog-data";
import { requireAdminUser } from "@/lib/supabase/admin";

export default function AdminPage() {
  return <Suspense fallback={<PageHeader title="Resumen comercial" description="Cargando panel…"/>}><AdminPageContent/></Suspense>;
}
async function AdminPageContent() {
  await connection();
  await requireAdminUser();
  const [products,categories,metrics,inventorySummary]=await Promise.all([getAdminProducts(),getAdminCategories(),getAdminDashboardMetrics(),getInventorySummary()]);
  return <DashboardOverview metrics={metrics} inventorySummary={inventorySummary} productCount={products.length} categoryCount={categories.length}/>;
}
