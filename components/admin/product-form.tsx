import Link from "next/link";
import type { AdminCatalogProduct } from "@/lib/catalog-data";
import { formatPresentationLabel } from "@/lib/presentation";
import type { CatalogCategory } from "@/types/catalog";

type ProductFormProps = {
  categories: CatalogCategory[];
  product?: AdminCatalogProduct | null;
  action: (formData: FormData) => Promise<void>;
};

export function ProductForm({
  categories,
  product,
  action,
}: ProductFormProps) {
  const existingPresentationCount = product?.presentations.length ?? 0;
  const presentationRows = [
    ...(product?.presentations ?? []),
    ...Array.from({
      length: Math.max(3, 5 - existingPresentationCount),
    }).map(() => ({
      id: undefined,
      etiqueta: "",
      precio: 0,
      measurementKind: "unit" as const,
      amountValue: 1,
      amountUnit: "unit" as const,
      amountInBaseUnits: 1,
      sortOrder: undefined,
    })),
  ];

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="productId" value={product?.uuid ?? ""} />
      <input type="hidden" name="existingImagePath" value={product?.imagePath ?? ""} />

      <section className="surface-panel organic-outline rounded-[1.8rem] p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-olive-dark">Slug</span>
            <input
              name="slug"
              defaultValue={product?.slug ?? ""}
              placeholder="harina-de-almendras"
              required
              className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-olive-dark">Nombre</span>
            <input
              name="name"
              defaultValue={product?.name ?? ""}
              placeholder="Harina de almendras"
              required
              className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-olive-dark">Imagen</span>
            <div className="space-y-3 rounded-[1.6rem] border border-dashed border-olive/18 bg-white/80 p-4">
              {product?.imagePath ? (
                <div className="space-y-2">
                  <span className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">
                    Imagen actual
                  </span>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.imagePath}
                      alt={product.name}
                      className="h-24 w-24 rounded-2xl object-cover"
                    />
                    <p className="text-sm text-foreground/66">{product.imagePath}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-foreground/66">
                  Subí la imagen del producto desde tu compu.
                </p>
              )}

              <input
                type="file"
                name="imageFile"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark file:mr-4 file:rounded-full file:border-0 file:bg-olive file:px-4 file:py-2 file:font-semibold file:text-white"
              />
              <p className="text-xs leading-5 text-foreground/58">
                Acepta PNG, JPG, WEBP o SVG. Las imágenes raster se convierten
                automáticamente a WEBP optimizado; los SVG se conservan tal cual.
                Si no elegís una nueva imagen al editar, se conserva la actual.
              </p>
            </div>
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-olive-dark">Descripción</span>
            <textarea
              name="description"
              defaultValue={product?.description ?? ""}
              rows={4}
              required
              className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-olive-dark">Etiquetas de búsqueda</span>
            <input
              name="tags"
              defaultValue={(product?.tags ?? []).join(", ")}
              placeholder="sin tacc, premium, desayuno"
              className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-olive-dark">Orden destacado</span>
            <input
              name="featuredOrder"
              type="number"
              min="0"
              step="1"
              defaultValue={product?.featuredOrder ?? ""}
              className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
            />
          </label>

          <div className="flex flex-wrap items-center gap-6 pt-8">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-olive-dark">
              <input
                type="checkbox"
                name="isFeatured"
                defaultChecked={product?.isFeatured ?? false}
                className="h-4 w-4 rounded border-olive/30 text-olive"
              />
              Destacado
            </label>

            <label className="inline-flex items-center gap-2 text-sm font-semibold text-olive-dark">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={product?.isActive ?? true}
                className="h-4 w-4 rounded border-olive/30 text-olive"
              />
              Activo
            </label>
          </div>
        </div>
      </section>

      <section className="surface-panel organic-outline rounded-[1.8rem] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-olive-dark">Categorías</h2>
            <p className="text-sm text-foreground/64">
              Elegí una o varias categorías visibles para el producto.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex items-start gap-3 rounded-2xl border border-olive/14 bg-white/90 px-4 py-3 text-sm text-olive-dark"
            >
              <input
                type="checkbox"
                name="categoryIds"
                value={category.id}
                defaultChecked={product?.categoryIds.includes(category.id) ?? false}
                className="mt-0.5 h-4 w-4 rounded border-olive/30 text-olive"
              />
              <span>{category.name}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="surface-panel organic-outline rounded-[1.8rem] p-5 sm:p-6">
        <div>
          <h2 className="text-xl font-semibold text-olive-dark">Presentaciones</h2>
          <p className="text-sm text-foreground/64">
            Cargá la medida real de cada presentación. La etiqueta visible se genera sola.
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {presentationRows.map((presentation, index) => (
            <div
              key={`${presentation.id ?? "new"}-${index}`}
              className="grid gap-3 rounded-2xl border border-olive/12 bg-white/90 p-4 md:grid-cols-[1fr_150px_1fr_110px]"
            >
              <input
                type="hidden"
                name="presentationId"
                value={presentation.id ?? ""}
              />
              <label className="space-y-2">
                <span className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">
                  Contenido
                </span>
                <input
                  name="presentationAmountValue"
                  defaultValue={presentation.amountValue > 0 ? presentation.amountValue : ""}
                  placeholder="500"
                  inputMode="decimal"
                  className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
                />
                <p className="text-xs leading-5 text-foreground/58">
                  {presentation.etiqueta
                    ? `Actual: ${presentation.etiqueta}`
                    : "Ejemplos: 500g, 350ml, 1 unidad, 6 unidades."}
                </p>
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">
                  Tipo
                </span>
                <select
                  name="presentationMeasurementKind"
                  defaultValue={presentation.measurementKind}
                  className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
                >
                  <option value="unit">Unidades</option>
                  <option value="weight">Peso</option>
                  <option value="volume">Volumen</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">
                  Unidad
                </span>
                <select
                  name="presentationAmountUnit"
                  defaultValue={presentation.amountUnit}
                  className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
                >
                  <option value="unit">unidad</option>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="l">l</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">
                  Orden
                </span>
                <input
                  name="presentationSortOrder"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={presentation.sortOrder ?? index}
                  className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">
                  Precio (ARS)
                </span>
                <input
                  name="presentationPrice"
                  defaultValue={presentation.precio > 0 ? presentation.precio : ""}
                  placeholder="7500"
                  inputMode="decimal"
                  className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
                />
              </label>
              <div className="rounded-2xl border border-olive/10 bg-olive-soft/24 px-4 py-3 md:col-span-2">
                <p className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">
                  Etiqueta visible
                </p>
                <p className="mt-1 text-sm font-semibold text-olive-dark">
                  {presentation.etiqueta ||
                    formatPresentationLabel({
                      measurementKind: presentation.measurementKind,
                      amountValue: presentation.amountValue,
                      amountUnit: presentation.amountUnit,
                    })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-olive px-5 py-3 text-sm font-semibold text-white hover:bg-olive-dark"
        >
          Guardar producto
        </button>
        <Link
          href="/admin"
          className="inline-flex items-center justify-center rounded-full border border-olive/14 bg-white px-5 py-3 text-sm font-semibold text-olive-dark hover:bg-olive-soft/36"
        >
          Volver
        </Link>
      </div>
    </form>
  );
}
