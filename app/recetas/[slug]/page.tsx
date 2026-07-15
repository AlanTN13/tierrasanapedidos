import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { RecipeProductCard } from "@/components/recipe-product-card";
import { getResolvedRecipeBySlug, getResolvedRecipes } from "@/lib/recipes-data";

type RecipePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return (await getResolvedRecipes()).map((recipe) => ({
    slug: recipe.slug,
  }));
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { slug } = await params;
  const recipe = await getResolvedRecipeBySlug(slug);

  if (!recipe) {
    notFound();
  }

  return (
    <main className="pb-16">
      <section className="container-shell pt-6 sm:pt-8">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white/78 px-4 py-2 text-sm font-semibold text-olive-dark shadow-[0_10px_22px_rgba(111,127,79,0.08)]"
          >
            ← Volver a la tienda
          </Link>
          <Link
            href="/recetas"
            className="inline-flex items-center gap-2 rounded-full bg-white/78 px-4 py-2 text-sm font-semibold text-olive-dark shadow-[0_10px_22px_rgba(111,127,79,0.08)]"
          >
            ← Ver recetas
          </Link>
        </div>
      </section>

      <section className="container-shell pt-4 pb-8 sm:pb-10">
        <div className="surface-panel organic-outline overflow-hidden rounded-[2.2rem]">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative min-h-[21rem] overflow-hidden">
              <Image
                src={recipe.heroImage}
                alt={recipe.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(47,51,40,0.02)_0%,rgba(47,51,40,0.42)_100%)]" />
            </div>

            <div className="px-5 py-6 sm:px-8 sm:py-8">
              <span className="section-kicker">Receta Tierra Sana</span>
              <h1 className="mt-4 font-display text-4xl leading-[0.98] font-semibold text-olive-dark sm:text-5xl">
                {recipe.title}
              </h1>
              <p className="mt-4 text-base leading-7 text-foreground/68">
                {recipe.longDescription}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <InfoPill label="Tiempo" value={recipe.prepLabel} />
                <InfoPill label="Rinde" value={recipe.servingsLabel} />
                <InfoPill label="Categoria" value={recipe.targetCategory} />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/?q=${encodeURIComponent(recipe.products[0]?.nombre ?? recipe.title)}`}
                  className="inline-flex items-center justify-center rounded-full bg-olive px-5 py-3 text-sm font-semibold text-white hover:bg-olive-dark"
                >
                  Buscar ingredientes
                </Link>
                <Link
                  href="/#productos"
                  className="inline-flex items-center justify-center rounded-full border border-olive/14 bg-white px-5 py-3 text-sm font-semibold text-olive-dark"
                >
                  Ir al catálogo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
        <article className="surface-panel organic-outline rounded-[1.9rem] px-5 py-6 sm:px-6">
          <span className="section-kicker">Ingredientes</span>
          <ul className="mt-5 space-y-3">
            {recipe.ingredients.map((ingredient) => (
              <li
                key={ingredient}
                className="rounded-[1rem] bg-white/84 px-4 py-3 text-sm leading-6 text-olive-dark"
              >
                {ingredient}
              </li>
            ))}
          </ul>
        </article>

        <article className="surface-panel organic-outline rounded-[1.9rem] px-5 py-6 sm:px-6">
          <span className="section-kicker">Paso a paso</span>
          <ol className="mt-5 space-y-4">
            {recipe.steps.map((step, index) => (
              <li
                key={step}
                className="rounded-[1.2rem] bg-white/84 px-4 py-4 text-sm leading-6 text-foreground/72"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-olive text-sm font-bold text-white">
                  {index + 1}
                </span>
                <p className="mt-3">{step}</p>
              </li>
            ))}
          </ol>
        </article>
      </section>

      <section className="container-shell pt-8">
        <div className="surface-panel organic-outline rounded-[1.9rem] px-5 py-6 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="section-kicker">Productos sugeridos</span>
              <h2 className="mt-3 font-display text-3xl font-semibold text-olive-dark sm:text-4xl">
                Lo que usarías para esta receta
              </h2>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            {recipe.products.map((product) => (
              <RecipeProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full bg-white/82 px-4 py-2 text-sm text-olive-dark shadow-[0_10px_24px_rgba(111,127,79,0.08)]">
      <strong className="font-semibold">{label}:</strong> {value}
    </div>
  );
}
