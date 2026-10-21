import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { HomeBannerPreview } from "@/components/admin/home-banner-preview";

export default function BannerPreviewPage() {
  return <Suspense fallback={<p>Cargando vista previa…</p>}><PreviewContent /></Suspense>;
}

async function PreviewContent() {
  await connection();
  if (process.env.VERCEL_ENV !== "preview" && process.env.NODE_ENV !== "development") notFound();
  return <HomeBannerPreview />;
}
