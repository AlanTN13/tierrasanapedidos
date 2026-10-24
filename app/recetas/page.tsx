import { RecipeCard } from "@/components/recipe-card";
import { getResolvedRecipes } from "@/lib/recipes-data";

export default async function RecipesPage() {
  const recipes = await getResolvedRecipes();

  return (
    <main id="main-content">
      <section id="inicio" className="container-shell pt-6 pb-5 sm:pt-8 sm:pb-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="font-display text-[32px] leading-tight font-semibold text-olive-dark sm:text-[40px]">
            Recetas Tierra Sana
          </h1>
          <span className="rounded-full bg-olive-soft/55 px-3 py-1 text-xs font-semibold text-olive-dark">
            {recipes.length} recetas
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/65 sm:text-[15px]">
          Ideas ricas para cocinar con lo que encontrás en la tienda.
        </p>
      </section>

      <section id="recetas" className="container-shell scroll-mt-44 pb-12 sm:pb-16" aria-label="Todas las recetas">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.slug} recipe={recipe} />
          ))}
        </div>
      </section>
    </main>
  );
}
