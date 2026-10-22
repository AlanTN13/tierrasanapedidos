import { Suspense } from "react";
import { connection } from "next/server";
import { saveHomeSettings } from "@/app/admin/actions";
import { HomeForm } from "@/components/admin/home-form";
import { PageHeader } from "@/components/admin/page-header";
import { getAdminHomeSettings } from "@/lib/home-data";
import { requireAdminUser } from "@/lib/supabase/admin";

type HomePageProps = { searchParams: Promise<{ saved?: string }> };

export default function AdminHomePage({ searchParams }: HomePageProps) {
  return (
    <Suspense fallback={<AdminHomeFallback />}>
      <AdminHomeContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AdminHomeContent({ searchParams }: HomePageProps) {
  await connection();
  await requireAdminUser();
  const settings = await getAdminHomeSettings();
  const { saved } = await searchParams;

  return (
    <div className="max-w-6xl space-y-4">
      <PageHeader
        title="Home de la web"
        description="Cargá hasta cuatro banners y elegí el orden del carrusel de portada."
      />
      {saved === "1" ? <p role="status" className="rounded-lg bg-olive-soft/40 p-3 text-sm font-semibold text-olive-dark">Los banners se guardaron correctamente.</p> : null}
      <HomeForm settings={settings} action={saveHomeSettings} />
    </div>
  );
}

function AdminHomeFallback() {
  return (
    <div className="max-w-6xl">
      <span className="section-kicker">Backoffice</span>
      <h1 className="mt-3 font-display text-4xl font-semibold text-olive-dark">Home</h1>
      <p className="mt-2 text-sm leading-6 text-foreground/66">Cargando banners...</p>
    </div>
  );
}
