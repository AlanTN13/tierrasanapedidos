import Image from "next/image";
import type { ResolvedHomeHeroConfig } from "@/types/home";

type HeroProps = {
  content: ResolvedHomeHeroConfig;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSubmitSearch: () => void;
  onClearSearch: () => void;
};

export function Hero({ content }: HeroProps) {
  return (
    <section id="inicio" className="container-shell pt-3 pb-6 sm:pt-6 sm:pb-9 lg:pt-3 lg:pb-7.5">
      <div className="surface-panel organic-outline hero-garden relative overflow-hidden rounded-[2rem] px-2.5 py-2.5 sm:rounded-[2.25rem] sm:px-4 sm:py-4 lg:px-4 lg:py-3.5">
        <div className="hero-soft-blob hero-soft-blob-left" />
        <div className="hero-soft-blob hero-soft-blob-right" />

        <div className="relative">
          <article className="organic-outline relative overflow-hidden rounded-[1.55rem] bg-white/55 shadow-[0_20px_36px_rgba(111,127,79,0.12)] sm:rounded-[1.8rem]">
            <div className="relative aspect-[1.48/1] sm:aspect-[2.25/1] lg:aspect-[2.65/1]">
              <Image
                src={content.bannerImage}
                alt={content.bannerAlt}
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 96vw, 1680px"
                className="object-cover"
              />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
