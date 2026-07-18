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
    <section id="inicio" className="pb-6 sm:pb-9 lg:pb-7.5">
      <article className="relative w-full overflow-hidden bg-white/55">
        <div className="relative aspect-[1.48/1] sm:aspect-[2.25/1] lg:aspect-[2.65/1]">
          <Image
            src={content.bannerImage}
            alt={content.bannerAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </article>
    </section>
  );
}
