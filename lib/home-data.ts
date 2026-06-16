import "server-only";

import { createClient as createPublicClient } from "@supabase/supabase-js";
import { cacheTag, revalidateTag } from "next/cache";
import { getCategoryCards } from "@/lib/catalog-data";
import { getDefaultHomeHero, getHomeContent } from "@/lib/home";
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

  return {
    ...fallbackHero,
    bannerImage: row?.hero_banner_path || fallbackHero.bannerImage,
    bannerAlt: fallbackHero.bannerAlt,
  };
}

async function getRawHomeSettings() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("home_settings")
    .select("id, hero_banner_path, hero_banner_alt, created_at, updated_at")
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

  const [categoryCards, settings] = await Promise.all([
    getCategoryCards(),
    getRawHomeSettings().catch(() => null),
  ]);

  return {
    ...getHomeContent(categoryCards),
    hero: mapHeroSettings(settings),
  };
}

export async function getAdminHomeSettings() {
  const fallbackHero = getDefaultHomeHero();

  if (!isSupabaseConfigured()) {
    return {
      id: "main",
      heroBannerPath: fallbackHero.bannerImage,
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("home_settings")
    .select("id, hero_banner_path, hero_banner_alt")
    .eq("id", "main")
    .maybeSingle();

  if (error && isMissingRelationError(error.message)) {
    return {
      id: "main",
      heroBannerPath: fallbackHero.bannerImage,
    };
  }

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data?.id ?? "main",
    heroBannerPath: data?.hero_banner_path ?? fallbackHero.bannerImage,
  };
}

export async function refreshHomeCache() {
  revalidateTag("home", "max");
}
