import type { AdminHomeSettings } from "@/types/admin-home";

type HomeFormProps = {
  settings: AdminHomeSettings;
  action: (formData: FormData) => Promise<void>;
};

export function HomeForm({ settings, action }: HomeFormProps) {
  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="existingHeroBannerPath" value={settings.heroBannerPath} />

      <section className="surface-panel organic-outline rounded-[1.8rem] p-5 sm:p-6">
        <div>
          <h2 className="text-xl font-semibold text-olive-dark">Banner principal</h2>
          <p className="text-sm text-foreground/64">
            Este banner aparece arriba de todo en la home pública.
          </p>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div className="space-y-3 rounded-[1.6rem] border border-dashed border-olive/18 bg-white/80 p-4">
            <span className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">
              Banner actual
            </span>
            <div className="overflow-hidden rounded-[1.4rem] border border-olive/10 bg-olive-soft/24">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={settings.heroBannerPath}
                alt="Banner principal actual"
                className="aspect-[2.55/1] w-full object-cover"
              />
            </div>
            <p className="text-xs leading-5 text-foreground/58">{settings.heroBannerPath}</p>
          </div>

          <div className="space-y-4">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-olive-dark">Nueva imagen</span>
              <input
                type="file"
                name="heroBannerFile"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark file:mr-4 file:rounded-full file:border-0 file:bg-olive file:px-4 file:py-2 file:font-semibold file:text-white"
              />
              <p className="text-xs leading-5 text-foreground/58">
                Podés subir PNG, JPG, WEBP o SVG. Las imágenes raster se convierten
                automáticamente a WEBP optimizado y los SVG se conservan tal cual.
                Si no subís una imagen nueva, se mantiene la actual.
              </p>
            </label>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-olive px-5 py-3 text-sm font-semibold text-white hover:bg-olive-dark"
        >
          Guardar banner
        </button>
      </div>
    </form>
  );
}
