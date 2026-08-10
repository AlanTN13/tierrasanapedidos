export type ResolvedHomeBannerPaths = {
  desktopPath: string;
  mobilePath: string;
};

export type SavedHomeBannerPaths = {
  desktopPath: string;
  mobilePath: string | null;
};

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
