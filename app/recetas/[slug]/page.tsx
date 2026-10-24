import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RecipeCard } from "@/components/recipe-card";
import { RecipeProductsPicker } from "@/components/recipe-product-card";
import { getResolvedRecipeBySlug, getResolvedRecipes } from "@/lib/recipes-data";

type RecipePageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getResolvedRecipes()).map(({ slug }) => ({ slug }));
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { slug } = await params;
  const [recipe, recipes] = await Promise.all([
    getResolvedRecipeBySlug(slug),
    getResolvedRecipes(),
  ]);
  if (!recipe) notFound();

  const related = recipes
    .filter((candidate) => candidate.slug !== recipe.slug)
    .sort(
      (a, b) =>
        Number(b.targetCategory === recipe.targetCategory) -
        Number(a.targetCategory === recipe.targetCategory),
    )
    .slice(0, 4);

  return (
    <main id="main-content">
      <article id="inicio" className="container-shell max-w-[1120px] pt-4 pb-10 sm:pt-6 sm:pb-14">
        <Link
          href="/recetas"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg text-sm font-semibold text-olive-dark hover:text-olive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive"
        >
          <span aria-hidden="true">←</span> Todas las recetas
        </Link>

        <header className="mt-3 grid items-center gap-5 sm:mt-4 sm:gap-7 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:gap-9">
          <div className="relative aspect-[4/3] w-full max-w-[480px] overflow-hidden rounded-2xl border border-olive/15 bg-cream">
            <Image
              src={recipe.heroImage}
              alt={recipe.title}
              fill
              preload
              sizes="(max-width: 767px) calc(100vw - 1rem), 480px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold tracking-[0.14em] text-olive uppercase">
              En la cocina de Tierra Sana
            </span>
            <h1 className="mt-2 font-display text-[32px] leading-tight font-semibold text-olive-dark sm:text-[40px]">
              {recipe.title}
            </h1>
            <p className="mt-3 text-[14px] leading-6 text-foreground/68 sm:text-[15px] sm:leading-7">
              {recipe.longDescription}
            </p>
            <dl className="mt-5 flex flex-wrap gap-3">
              <Meta label="Tiempo" value={recipe.prepLabel} />
              <Meta label="Rinde" value={recipe.servingsLabel} />
            </dl>
          </div>
        </header>

        <div className="mt-7 grid min-w-0 items-start gap-6 border-t border-olive/12 pt-7 sm:mt-9 sm:gap-8 sm:pt-9 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.7fr)] lg:gap-x-10">
          <section aria-labelledby="ingredientes-title" className="min-w-0 lg:col-start-1 lg:row-start-1">
            <h2 id="ingredientes-title" className="font-display text-[26px] leading-tight font-semibold text-olive-dark">
              Ingredientes
            </h2>
            <ul className="mt-4 overflow-hidden rounded-2xl border border-olive/15 bg-cream/40 px-4 sm:px-5">
              {recipe.ingredients.map((ingredient) => (
                <li key={ingredient} className="flex items-start gap-3 border-b border-olive/10 py-3 text-[14px] leading-6 text-foreground/75 last:border-0 sm:text-[15px]">
                  <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-olive/65" />
                  {ingredient}
                </li>
              ))}
            </ul>
          </section>

          {recipe.products.length > 0 ? (
            <div className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1">
              <RecipeProductsPicker products={recipe.products} />
            </div>
          ) : null}

          <section aria-labelledby="preparacion-title" className="min-w-0 lg:col-start-1 lg:row-start-2">
            <h2 id="preparacion-title" className="font-display text-[26px] leading-tight font-semibold text-olive-dark">
              Preparación
            </h2>
            <ol className="mt-3 divide-y divide-olive/12">
              {recipe.steps.map((step, index) => (
                <li key={step} className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 py-4 sm:gap-4 sm:py-5">
                  <span className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-full bg-olive-soft/55 text-[13px] font-semibold text-olive-dark">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="pt-0.5 text-[14px] leading-7 text-foreground/75 sm:text-[15px]">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {recipe.instagramUrl ? (
          <section className="mt-7 flex flex-col gap-4 rounded-2xl border border-olive/15 bg-cream/55 px-4 py-5 sm:mt-9 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6">
            <div className="min-w-0">
              <h2 className="text-[17px] font-semibold text-olive-dark">¿Querés verla en video?</h2>
              <p className="mt-1 text-sm leading-6 text-foreground/65">Encontrá esta receta y más ideas en nuestro Instagram.</p>
              <a
                href="https://www.instagram.com/tierrasana.dietetica/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center text-xs font-semibold text-olive-dark underline decoration-olive/30 underline-offset-4 hover:text-olive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive"
              >
                Seguir a @tierrasana.dietetica
              </a>
            </div>
            <a
              href={recipe.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-xl bg-olive-dark px-5 py-3 text-sm font-semibold text-white hover:bg-olive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive"
            >
              Ver esta receta en Instagram ↗
            </a>
          </section>
        ) : null}
      </article>

      {related.length > 0 ? (
        <section className="container-shell max-w-[1120px] pb-12 sm:pb-16" aria-labelledby="relacionadas-title">
          <h2 id="relacionadas-title" className="font-display text-[26px] leading-tight font-semibold text-olive-dark">
            Más recetas para probar
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
            {related.map((item) => (
              <RecipeCard key={item.slug} recipe={item} headingLevel="h3" />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[110px] rounded-xl border border-olive/12 bg-cream/55 px-4 py-2.5">
      <dt className="text-xs font-medium text-foreground/60">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-olive-dark">{value}</dd>
    </div>
  );
}
