"use client";

import { useEffect, useState } from "react";
import type { AdminHomeSettings } from "@/types/admin-home";

type HomeFormProps = {
  settings: AdminHomeSettings;
  action: (formData: FormData) => Promise<void>;
};

type BannerUploadProps = {
  title: string;
  recommendedSize: string;
  fieldName: "heroBannerDesktopFile" | "heroBannerMobileFile";
  currentPath: string;
  previewAlt: string;
  mobile?: boolean;
  fallbackMessage?: string;
};

export function HomeForm({ settings, action }: HomeFormProps) {
  const mobilePreviewPath = settings.heroBannerMobilePath || settings.heroBannerPath;

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="existingHeroBannerPath" value={settings.heroBannerPath} />
      <input
        type="hidden"
        name="existingHeroBannerMobilePath"
        value={settings.heroBannerMobilePath ?? ""}
      />

      <section className="surface-panel organic-outline rounded-[1.8rem] p-5 sm:p-6">
        <div>
          <h2 className="text-xl font-semibold text-olive-dark">Banner principal</h2>
          <p className="text-sm text-foreground/64">
            Cargá una imagen para computadora y otra para celular. Las medidas son
            recomendaciones y no bloquean la carga.
          </p>
        </div>

        <div className="mt-5 space-y-6">
          <BannerUpload
            title="Banner para computadora"
            recommendedSize="1920 × 720 px"
            fieldName="heroBannerDesktopFile"
            currentPath={settings.heroBannerPath}
            previewAlt="Banner actual para computadora"
          />
          <BannerUpload
            title="Banner para celular"
            recommendedSize="1080 × 1350 px"
            fieldName="heroBannerMobileFile"
            currentPath={mobilePreviewPath}
            previewAlt="Banner actual para celular"
            mobile
            fallbackMessage={
              settings.heroBannerMobilePath
                ? undefined
                : "Todavía no hay un banner para celular. Se está usando el banner para computadora como fallback."
            }
          />
        </div>
      </section>

      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full bg-olive px-5 py-3 text-sm font-semibold text-white hover:bg-olive-dark"
      >
        Guardar banners
      </button>
    </form>
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
    <div className="rounded-[1.6rem] border border-olive/14 bg-white/80 p-4 sm:p-5">
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

      <div className={`mt-4 grid gap-5 ${mobile ? "lg:grid-cols-[320px_1fr]" : "lg:grid-cols-[1.2fr_0.8fr]"}`}>
        <div className={mobile ? "mx-auto w-full max-w-[280px]" : "w-full"}>
          <div className="overflow-hidden rounded-[1.4rem] border border-olive/10 bg-olive-soft/24 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedPreview ?? currentPath}
              alt={selectedPreview ? `Vista previa de ${title.toLowerCase()}` : previewAlt}
              className="block h-auto w-full object-contain"
            />
          </div>
          <p className="mt-2 break-all text-xs leading-5 text-foreground/58">
            {selectedPreview ? "Vista previa del archivo seleccionado" : currentPath}
          </p>
        </div>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-olive-dark">Subir nueva imagen</span>
          <input
            type="file"
            name={fieldName}
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handleFileChange}
            className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark file:mr-4 file:rounded-full file:border-0 file:bg-olive file:px-4 file:py-2 file:font-semibold file:text-white"
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
