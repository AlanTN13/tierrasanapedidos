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
          className="group grid min-h-[156px] grid-cols-[32%_minmax(0,1fr)] overflow-hidden rounded-[1.25rem] border border-olive/15 bg-background transition-colors hover:border-olive/35 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-olive sm:min-h-[148px] sm:grid-cols-[26%_minmax(0,1fr)] lg:min-h-[160px] lg:grid-cols-[24%_minmax(0,1fr)]"
          aria-label="Ver recetas fáciles de Tierra Sana"
        >
          <span className="relative min-h-full overflow-hidden">
            <Image
              src="/storage/product-images/recipes/barritas-de-cereal-mt05rw71.webp"
              alt="Barritas de cereal sin horno"
              fill
              sizes="(min-width: 1280px) 410px, (min-width: 640px) 26vw, 32vw"
              className="object-cover"
            />
          </span>
          <span className="flex min-w-0 flex-col items-start justify-center gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 lg:px-10">
            <span className="min-w-0">
              <span className="block font-display text-[22px] font-semibold leading-tight text-olive-dark sm:text-[28px] lg:text-[32px]">
                Recetas fáciles
              </span>
              <span className="mt-1.5 block text-[12px] leading-[1.45] text-foreground/75 sm:text-[14px]">
                Ideas simples para disfrutar nuestros productos
              </span>
            </span>
            <span className="inline-flex min-h-[40px] shrink-0 items-center gap-3 rounded-full bg-olive-dark px-4 text-[13px] font-semibold text-white transition-colors group-hover:bg-olive-dark/90 sm:min-h-[44px] sm:px-5 sm:text-[14px]">
              Ver recetas <span aria-hidden="true">→</span>
            </span>
          </span>
        </Link>
      </div>
    </section>
  );
}
