import Image from "next/image";
import Link from "next/link";
import { getResolvedRecipes } from "@/lib/recipes-data";

export default async function RecipesPage() {
  const recipes = await getResolvedRecipes();

  return (
    <main id="main-content">
      <section id="inicio" className="container-shell pt-7 pb-6 sm:pt-10 sm:pb-8">
        <div className="max-w-3xl">
          <span className="section-kicker">Recetas Tierra Sana</span>
          <h1 className="mt-3 font-display text-[2.45rem] leading-[0.98] font-semibold text-olive-dark sm:text-5xl">
            Ideas ricas para cocinar con lo que encontrás en la tienda
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-foreground/66 sm:text-base sm:leading-7">
            Recetas simples, ingredientes nobles y productos que podés sumar al carrito sin cortar la inspiración.
          </p>
        </div>
      </section>

      <section id="recetas" className="container-shell pb-12" aria-label="Todas las recetas">
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-5 md:gap-y-8">
          {recipes.map((recipe) => (
            <article key={recipe.slug} className="group min-w-0">
              <Link href={`/recetas/${recipe.slug}`} className="block focus:outline-none">
                <div className="organic-outline card-shadow relative aspect-[0.92/1] overflow-hidden rounded-[1.2rem] bg-olive-soft/35 sm:aspect-[1.18/1] sm:rounded-[1.65rem]">
                  <Image
                    src={recipe.heroImage}
                    alt={recipe.title}
                    fill
                    sizes="(max-width: 767px) 50vw, 33vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.025]"
                  />
                </div>
                <div className="px-1 pt-3 sm:px-2 sm:pt-4">
                  <h2 className="line-clamp-2 text-[15px] leading-[1.2] font-semibold text-olive-dark sm:text-xl">
                    {recipe.title}
                  </h2>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[12px] font-medium text-foreground/58 sm:text-sm">
                    <ClockIcon /> {recipe.prepLabel}
                  </p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4l2.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
