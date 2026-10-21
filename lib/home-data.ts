import "server-only";

import { createClient as createPublicClient } from "@supabase/supabase-js";
import { cacheTag, revalidateTag } from "next/cache";
import { getCatalogProducts, getCategoryCards } from "@/lib/catalog-data";
import { resolveHomeBannerPaths, resolveHomeBanners } from "@/lib/home-banner";
import { getDefaultHomeHero, getFallbackHomeRecipeHighlights, getHomeContentWithRecipes } from "@/lib/home";
import { getHomeRecipeHighlights } from "@/lib/recipes-data";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { HomeContent } from "@/types/home";

type HomeSettingsRow = Database["public"]["Tables"]["home_settings"]["Row"];

function isMissingRelationError(message: string) {
  const normalized = message.toLowerCase();

  return (
    normalized.includes("schema cache") ||
    normalized.includes("could not find the table") ||
    normalized.includes("does not exist") ||
    normalized.includes("could not find the relation")
  );
}

function createSupabaseClient() {
  const { url, publishableKey } = getSupabaseEnv();
  return createPublicClient<Database>(url, publishableKey);
}

function mapHeroSettings(row: HomeSettingsRow | null | undefined) {
  const fallbackHero = getDefaultHomeHero();
  const bannerPaths = resolveHomeBannerPaths({
    desktopPath: row?.hero_banner_path,
    mobilePath: row?.hero_banner_mobile_path,
    fallbackDesktopPath: fallbackHero.bannerDesktopImage,
  });

  return {
    ...fallbackHero,
    bannerDesktopImage: bannerPaths.desktopPath,
    bannerMobileImage: bannerPaths.mobilePath,
    bannerAlt: row?.hero_banner_alt || fallbackHero.bannerAlt,
    banners: resolveHomeBanners(row?.hero_banners, {
      id: "legacy",
      desktopPath: bannerPaths.desktopPath,
      mobilePath: row?.hero_banner_mobile_path || null,
      alt: row?.hero_banner_alt || fallbackHero.bannerAlt,
    }),
  };
}

async function getRawHomeSettings() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("home_settings")
    .select("*")
    .eq("id", "main")
    .maybeSingle();

  if (error && isMissingRelationError(error.message)) {
    return null;
  }

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getResolvedHomeContent(): Promise<HomeContent> {
  "use cache";

  cacheTag("home");
  cacheTag("catalog");

  const [categoryCards, settings, recipeHighlights] = await Promise.all([
    getCategoryCards(),
    getRawHomeSettings().catch(() => null),
    getHomeRecipeHighlights().catch(async () =>
      getFallbackHomeRecipeHighlights(await getCatalogProducts()),
    ),
  ]);

  return {
    ...getHomeContentWithRecipes(categoryCards, recipeHighlights),
    hero: mapHeroSettings(settings),
  };
}

export async function getAdminHomeSettings() {
  const fallbackHero = getDefaultHomeHero();
  const fallback = {
    id: "main",
    heroBannerPath: fallbackHero.bannerDesktopImage,
    heroBannerMobilePath: null,
    banners: [{ id: "legacy", desktopPath: fallbackHero.bannerDesktopImage, mobilePath: null, alt: fallbackHero.bannerAlt }],
    carouselReady: false,
  };
  if (!isSupabaseConfigured()) return fallback;

  const supabase = await createServerSupabaseClient();
  // select(*) keeps the existing single banner usable before the additive setup is applied.
  const { data, error } = await supabase.from("home_settings").select("*").eq("id", "main").maybeSingle();
  if (error && isMissingRelationError(error.message)) return fallback;
  if (error) throw new Error(error.message);

  const legacy = {
    id: "legacy",
    desktopPath: data?.hero_banner_path || fallbackHero.bannerDesktopImage,
    mobilePath: data?.hero_banner_mobile_path || null,
    alt: data?.hero_banner_alt ?? fallbackHero.bannerAlt,
  };
  return {
    id: data?.id ?? "main",
    heroBannerPath: legacy.desktopPath,
    heroBannerMobilePath: legacy.mobilePath,
    banners: resolveHomeBanners(data?.hero_banners, legacy),
    carouselReady: Boolean(data && Object.hasOwn(data, "hero_banners")),
  };
}

export async function refreshHomeCache() {
  revalidateTag("home", "max");
}
