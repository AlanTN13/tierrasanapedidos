"use client";

import { AdminForm } from "@/components/admin/admin-form";
import type { AdminFormAction } from "@/lib/admin-form-result";
import { useEffect, useState } from "react";
import { MAX_HOME_BANNERS, validateBannerFiles } from "@/lib/home-banner";
import type { AdminHomeSettings } from "@/types/admin-home";

type HomeFormProps = {
  settings: AdminHomeSettings;
  action: AdminFormAction;
};

type BannerUploadProps = {
  title: string;
  recommendedSize: string;
  fieldName: string;
  currentPath: string;
  previewAlt: string;
  mobile?: boolean;
  fallbackMessage?: string;
};

export function HomeForm({ settings, action }: HomeFormProps) {
  const [banners, setBanners] = useState(settings.banners);

  function moveBanner(index: number, delta: number) {
    setBanners((current) => {
      const next = [...current];
      [next[index], next[index + delta]] = [next[index + delta], next[index]];
      return next;
    });
  }

  async function validatedAction(data: FormData) {
    const error = validateBannerFiles(data);
    if (error) return { error };
    return action(data);
  }

  return (
    <AdminForm action={validatedAction} className="space-y-4">
      {!settings.carouselReady ? (
        <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          El carrusel está preparado para habilitarse. La portada actual se conserva hasta completar la actualización.
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-olive-dark">Banners de portada</h2>
          <p className="text-sm text-foreground/64">Con un banner la imagen queda fija. Con varios, cambian cada 6 segundos.</p>
          <p className="mt-1 text-xs text-foreground/64">Hasta 4 MB en total por guardado. Usá imágenes del mismo tamaño para una transición uniforme.</p>
        </div>
        <span role="status" className="text-sm font-semibold text-olive-dark">{banners.length} de {MAX_HOME_BANNERS}</span>
      </div>

      {banners.map((banner, index) => (
        <section key={banner.id} className="surface-panel organic-outline min-w-0 rounded-xl p-4">
          <input type="hidden" name="bannerId" value={banner.id} />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold text-olive-dark">Banner {index + 1}</h3>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={index === 0} aria-label={`Subir banner ${index + 1}`} onClick={() => moveBanner(index, -1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-30">Subir</button>
              <button type="button" disabled={index === banners.length - 1} aria-label={`Bajar banner ${index + 1}`} onClick={() => moveBanner(index, 1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-30">Bajar</button>
              <button type="button" disabled={banners.length === 1} aria-label={`Quitar banner ${index + 1}`} onClick={() => setBanners((current) => current.filter((item) => item.id !== banner.id))} className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 disabled:opacity-30">Quitar</button>
            </div>
          </div>
          <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-2">
            <BannerUpload title="Imagen para computadora" recommendedSize="1920 × 720 px" fieldName={`bannerDesktopFile-${banner.id}`} currentPath={banner.desktopPath} previewAlt={`Banner ${index + 1} para computadora`} />
            <BannerUpload title="Imagen para celular (opcional)" recommendedSize="1080 × 1350 px" fieldName={`bannerMobileFile-${banner.id}`} currentPath={banner.mobilePath || banner.desktopPath} previewAlt={`Banner ${index + 1} para celular`} mobile fallbackMessage={!banner.mobilePath ? "Si no cargás una imagen para celular, se usa la de computadora." : undefined} />
          </div>
          {banner.mobilePath ? (
            <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" name={`removeBannerMobile-${banner.id}`} />Usar la imagen de computadora también en celular</label>
          ) : null}
          <label className="mt-4 block space-y-1 text-sm">
            <span className="font-semibold text-olive-dark">Descripción de la imagen</span>
            <input name={`bannerAlt-${banner.id}`} defaultValue={banner.alt} maxLength={200} placeholder="Describí lo que comunica el banner" className="w-full rounded-lg border border-olive/20 bg-white px-3 py-2" />
            <span className="block text-xs text-foreground/60">Para lectores de pantalla; no se agrega texto sobre la imagen.</span>
          </label>
        </section>
      ))}
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={banners.length >= MAX_HOME_BANNERS} onClick={() => setBanners((current) => [...current, { id: crypto.randomUUID(), desktopPath: "", mobilePath: null, alt: "" }])} className="rounded-lg border border-olive/25 px-4 py-2.5 text-sm font-semibold text-olive-dark disabled:opacity-40">Agregar banner</button>
        <button type="submit" disabled={!settings.carouselReady} className="rounded-lg bg-olive px-5 py-2.5 text-sm font-semibold text-white hover:bg-olive-dark disabled:opacity-40">Guardar banners</button>
      </div>
    </AdminForm>
  );
}

function BannerUpload({
  title,
  recommendedSize,
  fieldName,
  currentPath,
  previewAlt,
  mobile = false,
  fallbackMessage,
}: BannerUploadProps) {
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [selectedDimensions, setSelectedDimensions] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (selectedPreview) URL.revokeObjectURL(selectedPreview);
    };
  }, [selectedPreview]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (selectedPreview) URL.revokeObjectURL(selectedPreview);
    setSelectedDimensions(null);

    if (!file) {
      setSelectedPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedPreview(objectUrl);

    const image = new window.Image();
    image.onload = () => setSelectedDimensions(`${image.naturalWidth} × ${image.naturalHeight} px`);
    image.src = objectUrl;
  }

  return (
    <div className="min-w-0 rounded-lg border border-olive/14 bg-white/80 p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-olive-dark">{title}</h3>
          <p className="mt-1 text-sm font-medium text-earth">
            Medida recomendada: {recommendedSize}
          </p>
        </div>
        {fallbackMessage ? (
          <p className="max-w-md rounded-xl bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
            {fallbackMessage}
          </p>
        ) : null}
      </div>

      <div className="mt-3 grid min-w-0 gap-3">
        <div className={mobile ? "mx-auto w-full max-w-[280px]" : "w-full"}>
          <div className="overflow-hidden rounded-lg border border-olive/10 bg-olive-soft/24 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedPreview || currentPath || "/hero-optimized/banner-home.webp"}
              alt={selectedPreview ? `Vista previa de ${title.toLowerCase()}` : previewAlt}
              className="block max-h-56 w-full object-contain"
            />
          </div>
          <p className="mt-2 break-all text-xs leading-5 text-foreground/58">
            {selectedPreview ? "Vista previa del archivo seleccionado" : currentPath ? "Imagen guardada" : "Elegí una imagen"}
          </p>
        </div>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-olive-dark">Subir nueva imagen</span>
          <input
            type="file"
            name={fieldName}
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handleFileChange}
            className="min-w-0 max-w-full rounded-lg border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark file:mr-4 file:rounded-full file:border-0 file:bg-olive file:px-4 file:py-2 file:font-semibold file:text-white"
          />
          {selectedDimensions ? (
            <p className="text-xs font-medium text-olive-dark">
              Dimensión del archivo: {selectedDimensions}
            </p>
          ) : null}
          <p className="text-xs leading-5 text-foreground/58">
            Formatos aceptados: PNG, JPG, WEBP o SVG. Las imágenes raster se convierten
            a WEBP optimizado; los SVG se conservan. Si no elegís un archivo, esta imagen
            no cambia.
          </p>
        </label>
      </div>
    </div>
  );
}
