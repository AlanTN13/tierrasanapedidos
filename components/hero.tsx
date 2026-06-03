import Image from "next/image";
import type { ResolvedHomeHeroConfig } from "@/types/home";

type HeroProps = {
  content: ResolvedHomeHeroConfig;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSubmitSearch: () => void;
  onClearSearch: () => void;
};

export function Hero(props: HeroProps) {
  void props;

  return (
    <section id="inicio" className="container-shell pt-5 pb-8 sm:pt-7 sm:pb-10">
      <div className="surface-panel organic-outline hero-garden relative overflow-hidden rounded-[2.25rem] px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5">
        <div className="hero-soft-blob hero-soft-blob-left" />
        <div className="hero-soft-blob hero-soft-blob-right" />

        <div className="relative">
          <article className="organic-outline relative overflow-hidden rounded-[1.8rem] bg-white/55 shadow-[0_20px_36px_rgba(111,127,79,0.12)]">
            <div className="relative aspect-[1.9/1] sm:aspect-[2.2/1] lg:aspect-[2.55/1]">
              <Image
                src="/hero-optimized/banner-home.jpg"
                alt="Armá tu pedido en 3 pasos"
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
