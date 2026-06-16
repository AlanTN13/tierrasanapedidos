import { Suspense } from "react";
import { connection } from "next/server";
import { TransactionForm } from "@/components/admin/transaction-form";
import { saveSale } from "@/app/admin/operations/actions";
import { getAdminPresentationOptions } from "@/lib/admin-operations";
import { requireAdminUser } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/admin/page-header";

export default function NewSalePage() {
  return (
    <Suspense fallback={<SaleEditorFallback />}>
      <NewSaleContent />
    </Suspense>
  );
}

async function NewSaleContent() {
  await connection();
  await requireAdminUser();
  const options = await getAdminPresentationOptions();

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title="Nueva venta"
        description="Cargá la venta por presentación. El sistema descuenta el stock base real al guardar."
      />
      <TransactionForm mode="sale" options={options} action={saveSale} />
    </div>
  );
}

function SaleEditorFallback() {
  return (
    <div className="max-w-6xl">
      <span className="section-kicker">Backoffice</span>
      <h1 className="mt-3 font-display text-4xl font-semibold text-olive-dark">Nueva venta</h1>
      <p className="mt-2 text-sm leading-6 text-foreground/66">Cargando formulario...</p>
    </div>
  );
}
