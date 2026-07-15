"use client";

import Link from "next/link";
import Image from "next/image";
import type { FilterCategory } from "@/types/catalog";
import type { HomeContent } from "@/types/home";

type HomeDiscoveryProps = {
  content: HomeContent;
  onSelectCategory: (category: FilterCategory) => void;
  showCategories?: boolean;
  showIdeas?: boolean;
};

export function HomeDiscovery({
  content,
  onSelectCategory,
  showCategories = true,
  showIdeas = true,
}: HomeDiscoveryProps) {
  const featuredRecipeSlugs = [
    "cookies-de-mantequilla-de-mani",
    "trufas-fit",
    "quinoa-inflada-con-chocolate",
  ];
  const featuredRecipes = featuredRecipeSlugs
    .map((slug) => content.recipeHighlights.find((recipe) => recipe.slug === slug))
    .filter((recipe): recipe is NonNullable<typeof recipe> => Boolean(recipe));
  const featuredRecipeSlugSet = new Set(featuredRecipes.map((recipe) => recipe.slug));
  const visibleRecipes = [
    ...featuredRecipes,
    ...content.recipeHighlights.filter((recipe) => !featuredRecipeSlugSet.has(recipe.slug)),
  ].slice(0, 3);

  return (
    <>
      {showCategories ? (
        <section
          id="categorias"
          aria-labelledby="categorias-title"
          className="container-shell pb-10"
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="section-kicker">Nuestras categorias</span>
              <h2
                id="categorias-title"
                className="mt-3 font-display text-3xl font-semibold text-olive-dark sm:text-4xl"
              >
                Encontrá tus productos favoritos
              </h2>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {content.categoryCards.map((card) => (
              <button
                key={card.category}
                type="button"
                onClick={() => onSelectCategory(card.category)}
                className="group text-left"
                aria-label={`Ver productos de ${card.title}`}
              >
                <article className="organic-outline card-shadow relative overflow-hidden rounded-[1.35rem] bg-card sm:rounded-[1.9rem]">
                  <div className="relative aspect-[0.95/1] overflow-hidden sm:aspect-[1.28/1]">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1280px) 50vw, 25vw"
                      className="object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(47,51,40,0.04)_0%,rgba(47,51,40,0.58)_100%)]" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5">
                    <p className="max-w-[9rem] text-lg leading-[1.02] font-semibold text-white sm:max-w-[13rem] sm:text-2xl">
                      {card.title}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/92 px-2.5 py-1 text-[11px] font-semibold text-olive-dark sm:mt-3 sm:gap-2 sm:px-3 sm:py-1.5 sm:text-xs">
                      Ver productos
                      <ArrowUpRightIcon />
                    </span>
                  </div>
                </article>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {showIdeas ? (
        <section id="ideas" aria-labelledby="ideas-title" className="container-shell pb-10">
          <div className="surface-panel organic-outline overflow-hidden rounded-[2rem] px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="section-kicker">Recetas e ideas</span>
                <h2
                  id="ideas-title"
                  className="mt-3 font-display text-3xl font-semibold text-olive-dark sm:text-4xl"
                >
                  Recetas fáciles
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-foreground/64">
                Recetas rápidas para inspirarte y descubrir nuevos ingredientes.
              </p>
            </div>

            {visibleRecipes.length > 0 ? (
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {visibleRecipes.map((recipe) => (
                  <article
                    key={recipe.slug}
                    className="organic-outline card-shadow overflow-hidden rounded-[1.2rem] bg-white/90 sm:rounded-[1.45rem]"
                  >
                    <Link href={`/recetas/${recipe.slug}`} className="group block">
                      <div className="relative aspect-[1.6/1] overflow-hidden bg-olive-soft/35 sm:aspect-[1.45/1]">
                        <Image
                          src={recipe.heroImage}
                          alt={recipe.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          className="object-cover transition duration-500 group-hover:scale-[1.05]"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(47,51,40,0.04)_0%,rgba(47,51,40,0.5)_100%)]" />
                      </div>
                    </Link>

                    <div className="p-3.5 sm:p-4">
                      <h3 className="text-[1.15rem] leading-tight font-semibold text-olive-dark sm:text-[1.35rem]">
                        {recipe.title}
                      </h3>

                      <p className="mt-2 text-[13px] leading-5 text-foreground/66 line-clamp-2 sm:text-sm sm:leading-6">
                        {recipe.shortDescription}
                      </p>

                      <div className="mt-2.5 flex flex-wrap gap-2">
                        <span className="rounded-full bg-olive-soft/72 px-2 py-1 text-[9px] font-semibold text-olive-dark sm:px-2.5 sm:text-[10px]">
                          {recipe.prepLabel}
                        </span>
                        <span className="rounded-full bg-olive-soft/72 px-2 py-1 text-[9px] font-semibold text-olive-dark sm:px-2.5 sm:text-[10px]">
                          {recipe.servingsLabel}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link
                          href={`/recetas/${recipe.slug}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-olive px-3 py-2 text-[13px] font-semibold text-white hover:bg-olive-dark focus:outline-none focus:ring-2 focus:ring-olive/25 sm:gap-2 sm:px-3.5 sm:py-2.5 sm:text-sm"
                        >
                          Ver receta
                          <ArrowUpRightIcon />
                        </Link>
                        <button
                          type="button"
                          onClick={() => onSelectCategory(recipe.targetCategory)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-olive/14 bg-white px-3 py-2 text-[13px] font-semibold text-olive-dark hover:bg-olive-soft/36 focus:outline-none focus:ring-2 focus:ring-olive/25 sm:gap-2 sm:px-3.5 sm:py-2.5 sm:text-sm"
                          aria-label={`Comprar ingredientes para ${recipe.title}`}
                        >
                          Comprar ingredientes
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}

            <div className="mt-6 flex justify-center">
              <Link
                href="/recetas"
                className="inline-flex items-center gap-2 rounded-full border border-olive/14 bg-white px-4 py-3 text-sm font-semibold text-olive-dark hover:bg-olive-soft/36 focus:outline-none focus:ring-2 focus:ring-olive/25"
              >
                Ver más recetas
                <ArrowUpRightIcon />
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}
