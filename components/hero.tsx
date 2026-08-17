import { getImageProps } from "next/image";
import Link from "next/link";
import type { ResolvedHomeHeroConfig } from "@/types/home";

type HeroProps = {
  content: ResolvedHomeHeroConfig;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSubmitSearch: () => void;
  onClearSearch: () => void;
};

export function Hero({ content }: HeroProps) {
  const common = {
    alt: content.bannerAlt,
    sizes: "100vw",
    fetchPriority: "high" as const,
  };
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({
    ...common,
    src: content.bannerDesktopImage,
    width: 1920,
    height: 720,
    quality: 82,
  });
  const {
    props: { srcSet: mobileSrcSet, ...imageProps },
  } = getImageProps({
    ...common,
    src: content.bannerMobileImage,
    width: 1080,
    height: 1350,
    quality: 82,
  });

  return (
    <section id="inicio" className="pb-6 sm:pb-9 lg:pb-7.5">
      <article className="relative w-full overflow-hidden bg-white/55">
        <picture>
          <source media="(min-width: 768px)" srcSet={desktopSrcSet} />
          <source media="(max-width: 767px)" srcSet={mobileSrcSet} />
          {/* Dimensions are intentionally omitted: uploaded banners retain their natural ratio. */}
          <img
            {...imageProps}
            alt={content.bannerAlt}
            width={undefined}
            height={undefined}
            className="block h-auto w-full"
          />
        </picture>
      </article>

      <div className="container-shell mt-3 sm:mt-4">
        <Link
          href="/recetas"
          className="group flex items-center justify-between gap-4 rounded-[1.35rem] border border-olive/12 bg-[linear-gradient(110deg,rgba(230,237,210,0.95),rgba(255,253,248,0.98))] px-4 py-3.5 shadow-[0_8px_22px_rgba(72,82,50,0.08)] transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-olive/30 sm:px-5"
          aria-label="Ver recetas fáciles de Tierra Sana"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-olive text-white">
              <RecipeBookIcon />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-lg font-semibold leading-tight text-olive-dark">
                Recetas fáciles
              </span>
              <span className="mt-0.5 block truncate text-xs text-foreground/62 sm:text-sm">
                Ideas simples para disfrutar nuestros productos
              </span>
            </span>
          </span>
          <span
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-olive-dark shadow-sm transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          >
            →
          </span>
        </Link>
      </div>
    </section>
  );
}

function RecipeBookIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
      <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" />
      <path d="M7 7h1.5M15.5 7H17M7 10h1.5M15.5 10H17" />
    </svg>
  );
}
