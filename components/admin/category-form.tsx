import type { AdminCatalogCategory } from "@/lib/catalog-data";

type CategoryFormProps = {
  category?: AdminCatalogCategory | null;
  action: (formData: FormData) => Promise<void>;
};

export function CategoryForm({ category, action }: CategoryFormProps) {
  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="categoryId" value={category?.id ?? ""} />
      <input type="hidden" name="existingImagePath" value={category?.imagePath ?? ""} />

      <section className="surface-panel organic-outline rounded-[1.8rem] p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-olive-dark">Nombre</span>
            <input
              name="name"
              defaultValue={category?.name ?? ""}
              placeholder="Semillas"
              required
              className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-olive-dark">Slug</span>
            <input
              name="slug"
              defaultValue={category?.slug ?? ""}
              placeholder="semillas"
              className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-olive-dark">Imagen</span>
            <div className="space-y-3 rounded-[1.6rem] border border-dashed border-olive/18 bg-white/80 p-4">
              {category?.imagePath ? (
                <div className="space-y-2">
                  <span className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">
                    Imagen actual
                  </span>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={category.imagePath}
                      alt={category.name}
                      className="h-24 w-24 rounded-2xl object-cover"
                    />
                    <p className="text-sm text-foreground/66">{category.imagePath}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-foreground/66">
                  Subí la imagen de la categoría desde tu compu.
                </p>
              )}

              <input
                type="file"
                name="imageFile"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark file:mr-4 file:rounded-full file:border-0 file:bg-olive file:px-4 file:py-2 file:font-semibold file:text-white"
              />

              <input
                name="imagePath"
                defaultValue={category?.imagePath ?? ""}
                placeholder="/categorias-optimized/semillas.webp"
                className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
              />
              <p className="text-xs leading-5 text-foreground/58">
                Podés subir PNG, JPG, WEBP o SVG. Si preferís, también podés pegar
                una ruta manual o una URL absoluta. Si no cambiás nada, se conserva
                la imagen actual.
              </p>
            </div>
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-olive-dark">Tags de búsqueda</span>
            <input
              name="searchTags"
              defaultValue={(category?.searchTags ?? []).join(", ")}
              placeholder="semillas, desayuno, topping"
              className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-olive-dark">Orden</span>
            <input
              name="sortOrder"
              type="number"
              min="0"
              step="1"
              defaultValue={category?.sortOrder ?? 0}
              className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
            />
          </label>

          <div className="flex items-center pt-8">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-olive-dark">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={category?.isActive ?? true}
                className="h-4 w-4 rounded border-olive/30 text-olive"
              />
              Activa
            </label>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-olive px-5 py-3 text-sm font-semibold text-white hover:bg-olive-dark"
        >
          Guardar categoría
        </button>
      </div>
    </form>
  );
}
