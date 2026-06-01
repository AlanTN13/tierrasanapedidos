import Image from "next/image";
import { SearchBar } from "@/components/search-bar";
import type { ResolvedHomeHeroConfig } from "@/types/home";

type HeroProps = {
  content: ResolvedHomeHeroConfig;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSubmitSearch: () => void;
  onClearSearch: () => void;
};

export function Hero({
  content,
  searchQuery,
  onSearchChange,
  onSubmitSearch,
  onClearSearch,
}: HeroProps) {
  const [mainVisual, supportingVisual, accentVisual] = content.heroVisualItems;

  return (
    <section id="inicio" className="container-shell pt-5 pb-8 sm:pt-7 sm:pb-10">
      <div className="surface-panel organic-outline hero-garden relative overflow-hidden rounded-[2.25rem] px-4 py-4 sm:px-6 sm:py-5 lg:px-7 lg:py-6">
        <div className="hero-soft-blob hero-soft-blob-left" />
        <div className="hero-soft-blob hero-soft-blob-right" />

        <div className="relative grid gap-5 lg:grid-cols-[0.32fr_0.68fr] lg:items-stretch">
          <div className="relative z-10 flex flex-col justify-center py-2 lg:py-0">
            <span className="section-kicker">{content.eyebrow}</span>

            <h1 className="mt-4 max-w-[18rem] font-display text-[2rem] leading-[0.94] font-semibold text-olive-dark sm:max-w-[20rem] sm:text-[2.35rem] lg:text-[2.65rem]">
              {content.title}
            </h1>
            <p className="mt-3 max-w-[21rem] text-sm leading-6 text-foreground/66 sm:text-[0.95rem]">
              {content.description}
            </p>

            <form
              className="mt-5"
              onSubmit={(event) => {
                event.preventDefault();
                onSubmitSearch();
              }}
            >
              <div className="flex flex-col gap-3">
                <SearchBar
                  value={searchQuery}
                  onChange={onSearchChange}
                  placeholder={content.searchPlaceholder}
                />

                <div className="flex flex-wrap gap-2.5">
                  <a
                    href="#categorias"
                    className="inline-flex items-center justify-center rounded-full bg-olive px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_26px_rgba(111,127,79,0.22)] hover:bg-olive-dark focus:outline-none focus:ring-2 focus:ring-olive/35"
                  >
                    {content.primaryCtaLabel}
                  </a>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-full bg-white/86 px-4 py-2.5 text-sm font-semibold text-olive-dark shadow-[0_12px_24px_rgba(111,127,79,0.08)] hover:bg-olive-soft/45 focus:outline-none focus:ring-2 focus:ring-olive/35"
                  >
                    {content.secondaryCtaLabel}
                  </button>
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={onClearSearch}
                      className="inline-flex items-center justify-center rounded-full border border-olive/14 bg-white/58 px-4 py-2.5 text-sm font-semibold text-olive-dark hover:bg-white focus:outline-none focus:ring-2 focus:ring-olive/25"
                    >
                      Limpiar
                    </button>
                  ) : null}
                </div>
              </div>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              {content.heroSteps.map((step) => (
                <span
                  key={step.number}
                  className="inline-flex items-center gap-2 rounded-full border border-olive/10 bg-white/72 px-3 py-1.5 text-[0.76rem] font-medium text-olive-dark"
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-olive text-[0.65rem] font-bold text-white">
                    {step.number}
                  </span>
                  {step.label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-3 lg:h-[23rem] lg:grid-cols-[1.6fr_0.9fr]">
            {mainVisual ? (
              <article className="organic-outline relative overflow-hidden rounded-[1.9rem] bg-white/55 shadow-[0_20px_36px_rgba(111,127,79,0.12)] min-h-[15rem] sm:min-h-[18rem] lg:h-full">
                <Image
                  src={mainVisual.image}
                  alt={mainVisual.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 46vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,250,241,0.04)_0%,rgba(47,51,40,0.14)_100%)]" />
              </article>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2 lg:h-full lg:grid-cols-1 lg:grid-rows-2">
              {supportingVisual ? (
                <article className="organic-outline overflow-hidden rounded-[1.45rem] bg-[linear-gradient(180deg,rgba(221,232,207,0.95),rgba(255,251,243,0.96))] p-2.5 shadow-[0_18px_30px_rgba(111,127,79,0.12)]">
                  <div className="relative aspect-[1.15/1] overflow-hidden rounded-[1rem] bg-white/65 lg:h-[calc(100%-3.2rem)] lg:aspect-auto">
                    <Image
                      src={supportingVisual.image}
                      alt={supportingVisual.title}
                      fill
                      sizes="(max-width: 1024px) 42vw, 18vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="pt-2">
                    <p className="font-display text-[0.95rem] leading-tight font-semibold text-olive-dark">
                      {supportingVisual.title}
                    </p>
                  </div>
                </article>
              ) : null}

              {accentVisual ? (
                <article className="organic-outline overflow-hidden rounded-[1.45rem] bg-[linear-gradient(180deg,rgba(234,220,193,0.94),rgba(255,248,235,0.97))] p-2.5 shadow-[0_16px_28px_rgba(111,127,79,0.1)]">
                  <div className="relative aspect-[1.15/1] overflow-hidden rounded-[1rem] bg-white/72 lg:h-[calc(100%-4.1rem)] lg:aspect-auto">
                    <Image
                      src={accentVisual.image}
                      alt={accentVisual.title}
                      fill
                      sizes="(max-width: 1024px) 42vw, 18vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="pt-2">
                    <p className="text-[0.65rem] font-bold tracking-[0.14em] text-earth uppercase">
                      Idea simple
                    </p>
                    <p className="mt-1 font-display text-[0.95rem] leading-tight font-semibold text-olive-dark">
                      {accentVisual.title}
                    </p>
                  </div>
                </article>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
