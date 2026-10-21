"use client";

import { useEffect, useRef, useState } from "react";
import { HomeForm } from "@/components/admin/home-form";
import { HeroBannerCarousel } from "@/components/hero-banner-carousel";
import { AdminInputError } from "@/lib/admin-form-result";
import { saveHomeBannerCollection } from "@/lib/home-banner-save";
import type { HomeBanner } from "@/lib/home-banner";
import "@/app/admin/admin.css";

const initial: HomeBanner[] = [{ id: "legacy", desktopPath: "/hero-optimized/banner-home.webp", mobilePath: null, alt: "Armá tu pedido en 3 pasos" }];

// Preview-only sandbox. Files live in this tab; no Server Action, Storage or database writes.
export function HomeBannerPreview() {
  const [banners, setBanners] = useState(initial);
  const [version, setVersion] = useState(0);
  const [message, setMessage] = useState("");
  const urls = useRef<string[]>([]);
  useEffect(() => () => urls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  async function previewSave(data: FormData) {
    try {
      await saveHomeBannerCollection(data, banners, {
        upload: async (file) => { const url = URL.createObjectURL(file); urls.current.push(url); return url; },
        persist: async (next) => { setBanners(next); setVersion((value) => value + 1); },
      });
      setMessage("Vista previa actualizada. Los cambios se guardan sólo en esta pestaña.");
    } catch (error) {
      return { error: error instanceof AdminInputError ? error.message : "No se pudo preparar la vista previa." };
    }
  }

  return (
    <main className="admin-shell min-h-screen p-3 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="rounded-xl border border-olive/20 bg-white p-4">
          <h1 className="text-2xl font-semibold text-olive-dark">Carrusel de portada</h1>
          <p className="mt-2 text-sm">Prueba sin modificar la web: agregá tus imágenes, elegí el orden y tocá «Guardar banners» para ver el resultado. Al recargar se reinicia.</p>
          {message ? <p role="status" className="mt-2 text-sm font-semibold text-olive-dark">{message}</p> : null}
        </div>
        <HeroBannerCarousel key={version} banners={banners} />
        <HomeForm key={version} settings={{ id: "main", heroBannerPath: banners[0].desktopPath, heroBannerMobilePath: banners[0].mobilePath, banners, carouselReady: true }} action={previewSave} />
      </div>
    </main>
  );
}
