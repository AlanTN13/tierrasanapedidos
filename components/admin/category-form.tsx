import type { AdminCatalogCategory } from "@/lib/catalog-data";
import { ImageUploadField } from "@/components/admin/image-upload-field";

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
            <ImageUploadField
              currentImagePath={category?.imagePath}
              currentImageAlt={category?.name ?? "Imagen de la categoría"}
              emptyMessage="Subí la imagen de la categoría desde tu compu."
              removeFieldName="removeExistingImage"
              helperText="Podés subir PNG, JPG, WEBP o SVG. Las imágenes raster se convierten automáticamente a WEBP optimizado y los SVG se conservan tal cual. Si no elegís una imagen nueva, se mantiene la actual salvo que la borres."
            />
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
