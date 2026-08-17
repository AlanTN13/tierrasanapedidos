import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
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
      <article id="inicio">
        <div className="container-shell max-w-[68rem] pt-5 sm:pt-8">
          <Link
            href="/recetas"
            className="inline-flex items-center gap-2 text-sm font-semibold text-olive-dark hover:text-olive"
          >
            <span aria-hidden="true">←</span> Todas las recetas
          </Link>
        </div>

        <div className="container-shell max-w-[68rem] pt-4 pb-14 sm:pt-6 sm:pb-20">
          <div className="overflow-hidden rounded-[1.65rem] bg-[#fffdf8] shadow-[0_24px_70px_rgba(47,51,40,0.1)] ring-1 ring-olive/10 sm:rounded-[2.25rem]">
            <header>
              <div className="relative aspect-[1.28/1] overflow-hidden bg-olive-soft/30 sm:aspect-[1.7/1] lg:aspect-[2.05/1]">
                <Image
                  src={recipe.heroImage}
                  alt={recipe.title}
                  fill
                  preload
                  sizes="(max-width: 1088px) calc(100vw - 1rem), 1088px"
                  className="object-cover"
                />
              </div>

              <div className="px-5 pt-7 pb-8 sm:px-10 sm:pt-10 sm:pb-10 lg:px-16">
                <div className="mx-auto max-w-3xl">
                  <h1 className="font-display text-[2.55rem] leading-[0.98] font-semibold text-olive-dark sm:text-5xl lg:text-6xl">
                    {recipe.title}
                  </h1>
                  <p className="mt-4 text-[15px] leading-6 text-foreground/68 sm:mt-5 sm:text-base sm:leading-7">
                    {recipe.longDescription}
                  </p>
                  <dl className="mt-6 grid grid-cols-2 border-y border-olive/12 py-4">
                    <div className="border-r border-olive/12 pr-4">
                      <Meta label="Tiempo" value={recipe.prepLabel} />
                    </div>
                    <div className="pl-4">
                      <Meta label="Rinde" value={recipe.servingsLabel} />
                    </div>
                  </dl>
                </div>
              </div>
            </header>

            <div className="px-5 pb-10 sm:px-10 sm:pb-14 lg:px-16 lg:pb-16">
              <div className="mx-auto max-w-3xl space-y-14 sm:space-y-16">
                <section aria-labelledby="ingredientes-title">
                  <h2
                    id="ingredientes-title"
                    className="font-display text-3xl font-semibold text-olive-dark"
                  >
                    Ingredientes
                  </h2>
                  <ul className="mt-4 divide-y divide-olive/12 border-y border-olive/12">
                    {recipe.ingredients.map((ingredient) => (
                      <li
                        key={ingredient}
                        className="py-2.5 text-[15px] leading-6 text-foreground/72 sm:py-3 sm:text-base"
                      >
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                </section>

                {recipe.products.length > 0 ? (
                  <RecipeProductsPicker products={recipe.products} />
                ) : null}

                <section aria-labelledby="preparacion-title">
                  <h2
                    id="preparacion-title"
                    className="font-display text-3xl font-semibold text-olive-dark sm:text-4xl"
                  >
                    Preparación
                  </h2>
                  <ol className="mt-5 divide-y divide-olive/10 border-y border-olive/10">
                    {recipe.steps.map((step, index) => (
                      <li
                        key={step}
                        className="grid grid-cols-[2.75rem_1fr] gap-4 py-6 sm:grid-cols-[3.25rem_1fr] sm:gap-5 sm:py-7"
                      >
                        <span className="font-display text-3xl leading-none font-semibold text-olive/72 sm:text-4xl">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <p className="text-[15px] leading-7 text-foreground/72 sm:text-base">
                          {step}
                        </p>
                      </li>
                    ))}
                  </ol>
                </section>
              </div>
            </div>
          </div>
        </div>
      </article>

      {recipe.instagramUrl ? (
        <section className="container-shell max-w-[68rem] py-12 sm:py-16">
          <div className="overflow-hidden rounded-[1.6rem] bg-olive-dark text-white shadow-[0_20px_48px_rgba(47,51,40,0.16)] sm:grid sm:grid-cols-[15rem_1fr] sm:rounded-[2rem]">
            <div className="relative aspect-[1.5/1] sm:aspect-auto sm:min-h-[15rem]">
              <Image
                src={recipe.heroImage}
                alt=""
                fill
                sizes="(max-width: 639px) 100vw, 240px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center px-5 py-7 sm:px-8 sm:py-8">
              <h2 className="font-display text-3xl font-semibold">
                ¿Querés verla en video?
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/72">
                Encontrá esta receta y más ideas de Tierra Sana en Instagram.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href={recipe.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-olive-dark hover:bg-olive-soft"
                >
                  Ver esta receta en Instagram ↗
                </a>
                <a
                  href="https://www.instagram.com/tierrasana.dietetica/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center text-sm font-semibold text-white underline decoration-white/35 underline-offset-4 hover:text-white/82"
                >
                  Seguir a @tierrasana.dietetica
                </a>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section
          className="container-shell max-w-[72rem] py-12 sm:py-16"
          aria-labelledby="relacionadas-title"
        >
          <h2
            id="relacionadas-title"
            className="font-display text-3xl font-semibold text-olive-dark sm:text-4xl"
          >
            Más recetas para probar
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/recetas/${item.slug}`}
                className="group min-w-0"
              >
                <div className="relative aspect-[1.05/1] overflow-hidden rounded-[1.25rem] sm:aspect-[1.4/1] sm:rounded-[1.6rem]">
                  <Image
                    src={item.heroImage}
                    alt={item.title}
                    fill
                    sizes="(max-width: 767px) 50vw, 33vw"
                    className="object-cover transition group-hover:scale-[1.025]"
                  />
                </div>
                <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-olive-dark sm:text-lg">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-foreground/58 sm:text-sm">
                  {item.prepLabel}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-foreground/55">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-olive-dark">{value}</dd>
    </div>
  );
}
