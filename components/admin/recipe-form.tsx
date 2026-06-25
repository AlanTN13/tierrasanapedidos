import Link from "next/link";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import type { AdminRecipe } from "@/lib/recipes-data";

type RecipeProductOption = {
  id: string;
  label: string;
  categoryLabel: string;
};

type RecipeFormProps = {
  categories: string[];
  productOptions: RecipeProductOption[];
  recipe?: AdminRecipe | null;
  action: (formData: FormData) => Promise<void>;
};

export function RecipeForm({
  categories,
  productOptions,
  recipe,
  action,
}: RecipeFormProps) {
  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="recipeId" value={recipe?.id ?? ""} />
      <input type="hidden" name="existingImagePath" value={recipe?.heroImagePath ?? ""} />

      <section className="surface-panel organic-outline rounded-[1.8rem] p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-olive-dark">Título</span>
            <input
              name="title"
              defaultValue={recipe?.title ?? ""}
              placeholder="Cookies de mantequilla de maní"
              required
              className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-olive-dark">Slug</span>
            <input
              name="slug"
              defaultValue={recipe?.slug ?? ""}
              placeholder="cookies-de-mantequilla-de-mani"
              className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-olive-dark">Imagen principal</span>
            <ImageUploadField
              currentImagePath={recipe?.heroImagePath}
              currentImageAlt={recipe?.title ?? "Imagen principal de la receta"}
              emptyMessage="Subí la imagen principal de la receta."
              removeFieldName="removeExistingImage"
              helperText="Podés subir PNG, JPG, WEBP o SVG. Las imágenes raster se convierten automáticamente a WEBP optimizado y los SVG se conservan tal cual. Si no elegís una imagen nueva al editar, se mantiene la actual salvo que la borres."
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-olive-dark">Descripción corta</span>
            <textarea
              name="shortDescription"
              defaultValue={recipe?.shortDescription ?? ""}
              rows={3}
              required
              className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-olive-dark">Descripción larga</span>
            <textarea
              name="longDescription"
              defaultValue={recipe?.longDescription ?? ""}
              rows={5}
              required
              className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-olive-dark">Categoría sugerida</span>
            <select
              name="targetCategory"
              defaultValue={recipe?.targetCategory ?? categories[0] ?? ""}
              className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-olive-dark">Orden</span>
            <input
              name="sortOrder"
              type="number"
              min="0"
              step="1"
              defaultValue={recipe?.sortOrder ?? 0}
              className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-olive-dark">Tiempo</span>
            <input
              name="prepLabel"
              defaultValue={recipe?.prepLabel ?? ""}
              placeholder="12 a 15 min de horno"
              required
              className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-olive-dark">Rinde</span>
            <input
              name="servingsLabel"
              defaultValue={recipe?.servingsLabel ?? ""}
              placeholder="Varias cookies"
              required
              className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
            />
          </label>

          <div className="flex items-center pt-8">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-olive-dark">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={recipe?.isActive ?? true}
                className="h-4 w-4 rounded border-olive/30 text-olive"
              />
              Activa
            </label>
          </div>
        </div>
      </section>

      <section className="surface-panel organic-outline rounded-[1.8rem] p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-olive-dark">Ingredientes</span>
            <textarea
              name="ingredients"
              defaultValue={(recipe?.ingredients ?? []).join("\n")}
              rows={10}
              required
              className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
            />
            <p className="text-xs leading-5 text-foreground/58">
              Cargá un ingrediente por línea.
            </p>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-olive-dark">Paso a paso</span>
            <textarea
              name="steps"
              defaultValue={(recipe?.steps ?? []).join("\n")}
              rows={10}
              required
              className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
            />
            <p className="text-xs leading-5 text-foreground/58">
              Cargá un paso por línea, en el orden en que querés mostrarlo.
            </p>
          </label>
        </div>
      </section>

      <section className="surface-panel organic-outline rounded-[1.8rem] p-5 sm:p-6">
        <div>
          <h2 className="text-xl font-semibold text-olive-dark">Productos sugeridos</h2>
          <p className="text-sm text-foreground/64">
            Elegí qué productos del catálogo querés vincular a la receta.
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {productOptions.map((product) => (
            <label
              key={product.id}
              className="flex items-start gap-3 rounded-2xl border border-olive/14 bg-white/90 px-4 py-3 text-sm text-olive-dark"
            >
              <input
                type="checkbox"
                name="productIds"
                value={product.id}
                defaultChecked={recipe?.productIds.includes(product.id) ?? false}
                className="mt-0.5 h-4 w-4 rounded border-olive/30 text-olive"
              />
              <span>
                <strong className="block">{product.label}</strong>
                <span className="text-xs text-foreground/58">{product.categoryLabel}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-olive px-5 py-3 text-sm font-semibold text-white hover:bg-olive-dark"
        >
          Guardar receta
        </button>
        <Link
          href="/admin/recipes"
          className="inline-flex items-center justify-center rounded-full border border-olive/14 bg-white px-5 py-3 text-sm font-semibold text-olive-dark hover:bg-olive-soft/36"
        >
          Volver
        </Link>
      </div>
    </form>
  );
}
