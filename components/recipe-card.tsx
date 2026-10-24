import Image from "next/image";
import Link from "next/link";
import type { ResolvedRecipeHighlight } from "@/types/home";

type RecipeCardProps = {
  recipe: Pick<ResolvedRecipeHighlight, "slug" | "title" | "shortDescription" | "heroImage" | "prepLabel">;
  headingLevel?: "h2" | "h3";
};

export function RecipeCard({ recipe, headingLevel: Heading = "h2" }: RecipeCardProps) {
  return (
    <article className="relative min-w-0">
      <Link
        href={`/recetas/${recipe.slug}`}
        className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-olive/20 bg-background shadow-[0_2px_8px_rgba(47,51,40,0.04)] transition-colors hover:border-olive/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-olive"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-cream">
          <Image
            src={recipe.heroImage}
            alt=""
            fill
            sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.025]"
          />
        </div>
        <div className="flex flex-1 flex-col px-3 py-3 sm:px-4 sm:py-4">
          <Heading className="line-clamp-2 text-[14px] leading-5 font-semibold text-olive-dark sm:text-[18px] sm:leading-6">
            {recipe.title}
          </Heading>
          {recipe.shortDescription ? (
            <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-foreground/65 sm:text-[14px]">
              {recipe.shortDescription}
            </p>
          ) : null}
        </div>
        <div className="flex min-h-[48px] flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t border-olive/12 bg-cream/55 px-3 py-2 sm:px-4">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-foreground/65 sm:text-[13px]">
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7">
              <circle cx="10" cy="10" r="7" />
              <path d="M10 6v4l2.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {recipe.prepLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-olive-dark sm:text-[13px]">
            Ver receta <span aria-hidden="true">→</span>
          </span>
        </div>
      </Link>
    </article>
  );
}
