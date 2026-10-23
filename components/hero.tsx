import Link from "next/link";
import Image from "next/image";
import { HeroBannerCarousel } from "@/components/hero-banner-carousel";
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
    <section id="inicio" className="pb-4 sm:pb-6">
      <HeroBannerCarousel banners={content.banners?.length ? content.banners : [{
        id: "legacy",
        desktopPath: content.bannerDesktopImage,
        mobilePath: content.bannerMobileImage,
        alt: content.bannerAlt,
      }]} />

      <div className="container-shell mt-3 sm:mt-4">
        <Link
          href="/recetas"
          className="group mx-auto flex h-[64px] w-full max-w-[520px] items-center gap-3 overflow-hidden rounded-xl border border-olive/15 bg-background px-3 transition-colors hover:border-olive/35 hover:bg-cream/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-olive sm:gap-5 sm:pl-4 sm:pr-2"
          aria-label="Ver recetas fáciles de Tierra Sana"
        >
          <span className="shrink-0 whitespace-nowrap font-display text-[18px] font-semibold leading-tight text-foreground sm:text-[20px]">
            Recetas fáciles
          </span>
          <span className="ml-auto inline-flex shrink-0 items-center gap-2 text-[13px] font-medium text-olive-dark">
            <span className="hidden sm:inline">Ver recetas</span>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path d="M4 12h16m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="relative h-[48px] w-[60px] shrink-0 overflow-hidden rounded-lg sm:w-[72px]">
            <Image
              src="/storage/product-images/recipes/barritas-de-cereal-mt05rw71.webp"
              alt="Barritas de cereal sin horno"
              fill
              sizes="(min-width: 640px) 72px, 60px"
              className="object-cover object-top"
            />
          </span>
        </Link>
      </div>
    </section>
  );
}
