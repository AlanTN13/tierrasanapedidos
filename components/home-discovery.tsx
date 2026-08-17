"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart-provider";
import {
  addRecipeCartItems,
  getDefaultRecipeCartItems,
} from "@/lib/recipe-cart";
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
  const { addItem, openCart } = useCart();
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
  ].slice(0, 6);

  const addRecipeIngredients = (recipe: HomeContent["recipeHighlights"][number]) => {
    const cartItems = getDefaultRecipeCartItems(recipe.products);

    if (cartItems.length === 0) return;

    addRecipeCartItems(cartItems, addItem);
    openCart();
  };

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
                className="group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-olive/35 focus-visible:ring-offset-2"
                aria-label={`Ver productos de ${card.title}`}
              >
                <article className="organic-outline card-shadow relative overflow-hidden rounded-[1.35rem] bg-card shadow-[0_16px_30px_rgba(38,42,31,0.16)] transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_20px_36px_rgba(38,42,31,0.2)] sm:rounded-[1.9rem]">
                  <div className="relative aspect-[0.95/1] overflow-hidden sm:aspect-[1.28/1]">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1280px) 50vw, 25vw"
                      className="object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,22,17,0.02)_20%,rgba(20,22,17,0.22)_52%,rgba(16,18,14,0.92)_100%)]" />
                    <div className="absolute inset-x-0 bottom-0 h-2/3 shadow-[inset_0_-32px_38px_rgba(8,10,7,0.3)]" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-5">
                    <p className="max-w-[10rem] text-[1.25rem] leading-[1.02] font-semibold tracking-[-0.01em] text-white uppercase drop-shadow-[0_2px_7px_rgba(0,0,0,0.6)] sm:max-w-[15rem] sm:text-[1.8rem]">
                      {card.title}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-olive-dark shadow-[0_8px_20px_rgba(0,0,0,0.18)] sm:mt-4 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm">
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
            <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {visibleRecipes.map((recipe) => {
                const hasPurchasableProducts = getDefaultRecipeCartItems(
                  recipe.products,
                ).length > 0;

                return (
                  <article
                    key={recipe.slug}
                    className="organic-outline card-shadow flex min-w-0 flex-col overflow-hidden rounded-[1.2rem] bg-white/90 sm:rounded-[1.45rem]"
                  >
                    <Link
                      href={`/recetas/${recipe.slug}`}
                      className="group flex flex-1 flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-olive/35"
                      aria-label={`Ver receta ${recipe.title}`}
                    >
                      <div className="relative aspect-square overflow-hidden bg-olive-soft/35 sm:aspect-[1.35/1] lg:aspect-[1.55/1] xl:aspect-[1.8/1]">
                        <Image
                          src={recipe.heroImage}
                          alt={recipe.title}
                          fill
                          sizes="(max-width: 1023px) 50vw, 33vw"
                          className="object-cover transition duration-500 group-hover:scale-[1.04]"
                        />
                        <span
                          aria-hidden="true"
                          className="absolute right-2.5 bottom-2.5 inline-flex items-center gap-1 rounded-full bg-white/92 px-2.5 py-1.5 text-[10px] font-semibold text-olive-dark shadow-[0_6px_18px_rgba(28,32,23,0.18)] backdrop-blur-sm transition group-hover:bg-white sm:right-3 sm:bottom-3 sm:px-3 sm:text-xs"
                        >
                          Ver receta
                          <ArrowUpRightIcon />
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col p-3 sm:p-4">
                        <h3 className="line-clamp-2 min-h-[2.25rem] text-[0.95rem] leading-[1.18] font-semibold text-olive-dark sm:min-h-[2.8rem] sm:text-[1.2rem]">
                          {recipe.title}
                        </h3>
                        <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-foreground/58 sm:text-xs">
                          <ClockIcon />
                          {recipe.prepLabel}
                        </span>
                      </div>
                    </Link>

                    {hasPurchasableProducts ? (
                      <div className="px-3 pb-3 sm:px-4 sm:pb-4">
                        <button
                          type="button"
                          onClick={() => addRecipeIngredients(recipe)}
                          className="inline-flex min-h-9 w-full items-center justify-center rounded-full border border-olive/14 bg-olive-soft/30 px-2.5 py-2 text-[11px] leading-tight font-semibold text-olive-dark transition hover:bg-olive-soft/55 focus:outline-none focus:ring-2 focus:ring-olive/25 sm:text-xs"
                          aria-label={`Comprar ingredientes para ${recipe.title}`}
                        >
                          Comprar ingredientes
                        </button>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : null}

          <div className="mt-6 flex justify-center">
            <Link
              href="/recetas"
              className="inline-flex items-center gap-2 rounded-full border border-olive/14 bg-white px-4 py-3 text-sm font-semibold text-olive-dark hover:bg-olive-soft/36 focus:outline-none focus:ring-2 focus:ring-olive/25"
            >
              Ver todas las recetas
              <ArrowUpRightIcon />
            </Link>
          </div>
        </section>
      ) : null}
    </>
  );
}

function ClockIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.5 1.5" />
    </svg>
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
