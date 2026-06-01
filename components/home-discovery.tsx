"use client";

import Link from "next/link";
import Image from "next/image";
import type { FilterCategory } from "@/types/catalog";
import type { HomeContent } from "@/types/home";

type HomeDiscoveryProps = {
  content: HomeContent;
  onSelectCategory: (category: FilterCategory) => void;
};

export function HomeDiscovery({
  content,
  onSelectCategory,
}: HomeDiscoveryProps) {
  return (
    <>
      <section id="categorias" className="container-shell pb-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="section-kicker">Categorias</span>
            <h2 className="mt-3 font-display text-3xl font-semibold text-olive-dark sm:text-4xl">
              Entrá por lo que necesitás
            </h2>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {content.categoryCards.map((card) => (
            <button
              key={card.category}
              type="button"
              onClick={() => onSelectCategory(card.category)}
              className="group text-left"
            >
              <article className="organic-outline card-shadow relative overflow-hidden rounded-[1.9rem] bg-card">
                <div className="relative aspect-[1.28/1] overflow-hidden">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(47,51,40,0.04)_0%,rgba(47,51,40,0.58)_100%)]" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <p className="max-w-[13rem] text-2xl leading-[1.02] font-semibold text-white">
                    {card.title}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/92 px-3 py-1.5 text-xs font-semibold text-olive-dark">
                    Ver productos
                    <ArrowUpRightIcon />
                  </span>
                </div>
              </article>
            </button>
          ))}
        </div>
      </section>

      <section id="ideas" className="container-shell pb-10">
        <div className="surface-panel organic-outline overflow-hidden rounded-[2rem] px-5 py-6 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="section-kicker">Recetas e ideas</span>
              <h2 className="mt-3 font-display text-3xl font-semibold text-olive-dark sm:text-4xl">
                Ideas ricas para comprar con ganas
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-foreground/64">
              Recetas simples, visuales y con una bajada más completa para inspirar la compra.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {content.recipeHighlights.map((recipe) => (
              <article
                key={recipe.slug}
                className="organic-outline card-shadow overflow-hidden rounded-[1.55rem] bg-white/88"
              >
                <Link href={`/recetas/${recipe.slug}`} className="group block">
                  <div className="relative aspect-[1.4/1] overflow-hidden bg-olive-soft/35">
                    <Image
                      src={recipe.heroImage}
                      alt={recipe.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover transition duration-300 group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(47,51,40,0.04)_0%,rgba(47,51,40,0.52)_100%)]" />
                    <div className="absolute right-3 bottom-3 left-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/92 px-2.5 py-1 text-[11px] font-semibold text-olive-dark">
                        {recipe.prepLabel}
                      </span>
                      <span className="rounded-full bg-white/92 px-2.5 py-1 text-[11px] font-semibold text-olive-dark">
                        {recipe.servingsLabel}
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="p-4">
                  <h3 className="text-xl font-semibold text-olive-dark">
                    {recipe.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-foreground/66">
                    {recipe.shortDescription}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {recipe.products.slice(0, 2).map((product) => (
                      <span
                        key={product.id}
                        className="rounded-full bg-olive-soft/72 px-2.5 py-1 text-[11px] font-semibold text-olive-dark"
                      >
                        {product.nombre}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2.5">
                    <Link
                      href={`/recetas/${recipe.slug}`}
                      className="inline-flex items-center gap-2 rounded-full bg-olive px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-olive-dark focus:outline-none focus:ring-2 focus:ring-olive/25"
                    >
                      Ver receta
                      <ArrowUpRightIcon />
                    </Link>
                    <button
                      type="button"
                      onClick={() => onSelectCategory(recipe.targetCategory)}
                      className="inline-flex items-center gap-2 rounded-full border border-olive/14 bg-white px-3.5 py-2.5 text-sm font-semibold text-olive-dark hover:bg-olive-soft/36 focus:outline-none focus:ring-2 focus:ring-olive/25"
                    >
                      Ver ingredientes
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

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
