import type { HomeBanner } from "@/lib/home-banner";

export type AdminHomeSettings = {
  id: string;
  heroBannerPath: string;
  heroBannerMobilePath: string | null;
  banners: HomeBanner[];
  carouselReady: boolean;
};
