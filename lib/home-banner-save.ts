import { AdminInputError } from "./admin-form-result.ts";
import { MAX_HOME_BANNERS, validateBannerFiles, type HomeBanner } from "./home-banner.ts";

type BannerSaveDependencies = {
  upload: (file: File, id: string, variant: "desktop" | "mobile") => Promise<string>;
  persist: (banners: HomeBanner[]) => Promise<void>;
};

// Validate every slide before uploading anything. Existing paths always come from the server.
export async function saveHomeBannerCollection(
  formData: FormData,
  current: HomeBanner[],
  { upload, persist }: BannerSaveDependencies,
) {
  const ids = formData.getAll("bannerId");
  if (!ids.length || ids.length > MAX_HOME_BANNERS || new Set(ids).size !== ids.length) {
    throw new AdminInputError("La portada necesita entre 1 y 4 banners, sin repetirlos.");
  }
  const fileError = validateBannerFiles(formData);
  if (fileError) throw new AdminInputError(fileError);

  const drafts = ids.map((value) => {
    if (typeof value !== "string" || !/^[a-zA-Z0-9-]{1,64}$/.test(value)) {
      throw new AdminInputError("No pudimos identificar un banner. Recargá la página e intentá de nuevo.");
    }
    const previous = current.find((banner) => banner.id === value);
    const desktop = formData.get(`bannerDesktopFile-${value}`);
    const mobile = formData.get(`bannerMobileFile-${value}`);
    const desktopFile = desktop instanceof File && desktop.size ? desktop : null;
    const mobileFile = mobile instanceof File && mobile.size ? mobile : null;
    if (!desktopFile && !previous?.desktopPath) {
      throw new AdminInputError("Elegí una imagen para computadora en cada banner.", `bannerDesktopFile-${value}`);
    }
    const alt = formData.get(`bannerAlt-${value}`);
    return {
      id: value,
      previous,
      desktopFile,
      mobileFile,
      removeMobile: formData.get(`removeBannerMobile-${value}`) === "on",
      alt: typeof alt === "string" ? alt.trim().slice(0, 200) : "",
    };
  });

  const banners: HomeBanner[] = [];
  for (const draft of drafts) {
    banners.push({
      id: draft.id,
      desktopPath: draft.desktopFile
        ? await upload(draft.desktopFile, draft.id, "desktop")
        : draft.previous!.desktopPath,
      mobilePath: draft.mobileFile
        ? await upload(draft.mobileFile, draft.id, "mobile")
        : draft.removeMobile ? null : draft.previous?.mobilePath ?? null,
      alt: draft.alt,
    });
  }
  // One database write. Keep previous assets available for rollback and unsuccessful retries.
  await persist(banners);
  return banners;
}
