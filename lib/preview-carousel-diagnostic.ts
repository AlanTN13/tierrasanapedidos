"use server";

export async function reportPreviewCarousel(json: string): Promise<boolean> {
  if (process.env.VERCEL_ENV !== "preview" || typeof json !== "string" || json.length > 6000) return false;
  let parsed: unknown;
  try { parsed = JSON.parse(json); } catch { return false; }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return false;
  const data = parsed as Record<string, unknown>;
  if (!Array.isArray(data.visible) || typeof data.phase !== "string") return false;
  const { phase, ios, touching, touchPoints, dpr, cycle, left, width, content, behavior, root, rootScroll, primary, after, visible } = data;
  console.info("TIERRA_SANA_CAROUSEL_MOBILE", JSON.stringify({ phase, ios, touching, touchPoints, dpr, cycle, left, width, content, behavior, root, rootScroll, primary, after, visible }));
  return true;
}
