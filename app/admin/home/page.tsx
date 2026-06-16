import { Suspense } from "react";
import { connection } from "next/server";
import { saveHomeSettings } from "@/app/admin/actions";
import { HomeForm } from "@/components/admin/home-form";
import { PageHeader } from "@/components/admin/page-header";
import { getAdminHomeSettings } from "@/lib/home-data";
import { requireAdminUser } from "@/lib/supabase/admin";

export default function AdminHomePage() {
  return (
    <Suspense fallback={<AdminHomeFallback />}>
      <AdminHomeContent />
    </Suspense>
  );
}

async function AdminHomeContent() {
  await connection();
  await requireAdminUser();
  const settings = await getAdminHomeSettings();

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title="Home"
        description="Gestioná el banner principal de la web desde el backoffice."
      />
      <HomeForm settings={settings} action={saveHomeSettings} />
    </div>
  );
}

function AdminHomeFallback() {
  return (
    <div className="max-w-6xl">
      <span className="section-kicker">Backoffice</span>
      <h1 className="mt-3 font-display text-4xl font-semibold text-olive-dark">Home</h1>
      <p className="mt-2 text-sm leading-6 text-foreground/66">Cargando banner...</p>
    </div>
  );
}
