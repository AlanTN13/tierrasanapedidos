import Link from "next/link";
import Image from "next/image";
import productsData from "@/data/products.json";
import { getRecipeHighlights } from "@/lib/home";
import type { Product } from "@/types/catalog";

const products = productsData as Product[];
const recipes = getRecipeHighlights(products);

export default function RecipesPage() {
  return (
    <main className="pb-16">
      <section className="container-shell pt-6 sm:pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-white/78 px-4 py-2 text-sm font-semibold text-olive-dark shadow-[0_10px_22px_rgba(111,127,79,0.08)]"
        >
          ← Volver a la tienda
        </Link>
      </section>

      <section className="container-shell pt-4 pb-8 sm:pb-10">
        <div className="surface-panel organic-outline rounded-[2.1rem] px-5 py-6 sm:px-6 sm:py-7">
          <span className="section-kicker">Recetas Tierra Sana</span>
          <h1 className="mt-3 font-display text-4xl leading-[0.98] font-semibold text-olive-dark sm:text-5xl">
            Tres ideas simples para cocinar con productos reales
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-foreground/68">
            Una selección corta y bien visual para que explores recetas, entiendas cómo se hacen y pases directo a los ingredientes cuando te den ganas.
          </p>
        </div>
      </section>

      <section className="container-shell">
        <div className="grid gap-5 xl:grid-cols-3">
          {recipes.map((recipe) => (
            <article
              key={recipe.slug}
              className="organic-outline card-shadow overflow-hidden rounded-[1.8rem] bg-white/88"
            >
              <Link href={`/recetas/${recipe.slug}`} className="group block">
                <div className="relative aspect-[1.12/1] overflow-hidden bg-olive-soft/30">
                  <Image
                    src={recipe.heroImage}
                    alt={recipe.title}
                    fill
                    sizes="(max-width: 1280px) 100vw, 33vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                </div>
              </Link>

              <div className="p-5">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-olive-soft/72 px-2.5 py-1 text-[11px] font-semibold text-olive-dark">
                    {recipe.prepLabel}
                  </span>
                  <span className="rounded-full bg-olive-soft/72 px-2.5 py-1 text-[11px] font-semibold text-olive-dark">
                    {recipe.servingsLabel}
                  </span>
                </div>

                <h2 className="mt-3 text-2xl leading-tight font-semibold text-olive-dark">
                  {recipe.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-foreground/66">
                  {recipe.shortDescription}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {recipe.products.slice(0, 3).map((product) => (
                    <span
                      key={product.id}
                      className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-olive-dark shadow-[0_8px_18px_rgba(111,127,79,0.08)]"
                    >
                      {product.nombre}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  <Link
                    href={`/recetas/${recipe.slug}`}
                    className="inline-flex items-center gap-2 rounded-full bg-olive px-4 py-2.5 text-sm font-semibold text-white hover:bg-olive-dark"
                  >
                    Ver receta
                  </Link>
                  <Link
                    href={`/?q=${encodeURIComponent(recipe.products[0]?.nombre ?? recipe.title)}`}
                    className="inline-flex items-center gap-2 rounded-full border border-olive/14 bg-white px-4 py-2.5 text-sm font-semibold text-olive-dark hover:bg-olive-soft/36"
                  >
                    Buscar ingredientes
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
