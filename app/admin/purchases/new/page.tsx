import { Suspense } from "react";
import { connection } from "next/server";
import { TransactionForm } from "@/components/admin/transaction-form";
import { savePurchaseOrder } from "@/app/admin/operations/actions";
import { getAdminPurchaseProductOptions } from "@/lib/admin-operations";
import { requireAdminUser } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/admin/page-header";

export default function NewPurchasePage() {
  return (
    <Suspense fallback={<PurchaseEditorFallback />}>
      <NewPurchaseContent />
    </Suspense>
  );
}

async function NewPurchaseContent() {
  await connection();
  await requireAdminUser();
  const options = await getAdminPurchaseProductOptions();

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title="Nueva compra"
        description="Buscá un producto único y cargá la compra en kg, litros o unidades según corresponda."
      />
      <TransactionForm mode="purchase" options={options} action={savePurchaseOrder} />
    </div>
  );
}

function PurchaseEditorFallback() {
  return (
    <div className="max-w-6xl">
      <span className="section-kicker">Backoffice</span>
      <h1 className="mt-3 font-display text-4xl font-semibold text-olive-dark">Nueva compra</h1>
      <p className="mt-2 text-sm leading-6 text-foreground/66">Cargando formulario...</p>
    </div>
  );
}
