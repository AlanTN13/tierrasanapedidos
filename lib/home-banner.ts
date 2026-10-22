export type ResolvedHomeBannerPaths = {
  desktopPath: string;
  mobilePath: string;
};

export type SavedHomeBannerPaths = {
  desktopPath: string;
  mobilePath: string | null;
};

export type HomeBanner = {
  id: string;
  desktopPath: string;
  mobilePath: string | null;
  alt: string;
};

export const MAX_HOME_BANNERS = 4;
// Leave room for multipart fields below the hosting request limit.
export const MAX_BANNER_UPLOAD_BYTES = 4 * 1024 * 1024;

export function resolveHomeBanners(value: unknown, legacy: HomeBanner): HomeBanner[] {
  if (!Array.isArray(value)) return [legacy];
  const seen = new Set<string>();
  const banners: HomeBanner[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const { id, desktopPath, mobilePath, alt } = entry;
    if (typeof id !== "string" || !/^[a-zA-Z0-9-]{1,64}$/.test(id) || seen.has(id)) continue;
    if (typeof desktopPath !== "string" || !isBannerPath(desktopPath)) continue;
    seen.add(id);
    banners.push({
      id,
      desktopPath,
      mobilePath: typeof mobilePath === "string" && isBannerPath(mobilePath) ? mobilePath : null,
      alt: typeof alt === "string" ? alt.slice(0, 200) : "",
    });
    if (banners.length === MAX_HOME_BANNERS) break;
  }
  return banners.length ? banners : [legacy];
}

function isBannerPath(value: string) {
  return (value.startsWith("/") && !value.startsWith("//")) || value.startsWith("https://");
}

export function validateBannerFiles(formData: FormData): string | null {
  let bytes = 0;
  for (const [name, file] of formData) {
    if (!name.startsWith("bannerDesktopFile-") && !name.startsWith("bannerMobileFile-")) continue;
    if (!(file instanceof File) || file.size === 0) continue;
    if (!/^image\/(png|jpeg|webp|svg\+xml)$/.test(file.type)) {
      return "Usá imágenes PNG, JPG, WEBP o SVG para los banners.";
    }
    bytes += file.size;
  }
  return bytes > MAX_BANNER_UPLOAD_BYTES
    ? "Las imágenes seleccionadas superan 4 MB en total. Reducí su peso y volvé a guardar."
    : null;
}

type ResolveHomeBannerPathsInput = {
  desktopPath?: string | null;
  mobilePath?: string | null;
  fallbackDesktopPath: string;
};

type ResolveHomeBannerSavePathsInput = {
  existingDesktopPath: string;
  existingMobilePath: string;
  uploadedDesktopPath?: string;
  uploadedMobilePath?: string;
  fallbackDesktopPath: string;
};

export function resolveHomeBannerPaths({
  desktopPath,
  mobilePath,
  fallbackDesktopPath,
}: ResolveHomeBannerPathsInput): ResolvedHomeBannerPaths {
  const resolvedDesktopPath = desktopPath || fallbackDesktopPath;

  return {
    desktopPath: resolvedDesktopPath,
    mobilePath: mobilePath || resolvedDesktopPath,
  };
}

export function resolveHomeBannerSavePaths({
  existingDesktopPath,
  existingMobilePath,
  uploadedDesktopPath,
  uploadedMobilePath,
  fallbackDesktopPath,
}: ResolveHomeBannerSavePathsInput): SavedHomeBannerPaths {
  return {
    desktopPath: uploadedDesktopPath || existingDesktopPath || fallbackDesktopPath,
    mobilePath: uploadedMobilePath || existingMobilePath || null,
  };
}
