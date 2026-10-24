"use server";

// Temporary observation for the protected preview. Never writes application data.
export async function reportPreviewLayout(json: string): Promise<boolean> {
  if (process.env.VERCEL_ENV !== "preview" || typeof json !== "string" || json.length > 24_000) return false;
  let report: unknown;
  try { report = JSON.parse(json); } catch { return false; }
  if (!report || typeof report !== "object" || Array.isArray(report)) return false;
  const data = report as Record<string, unknown>;
  if (data.version !== 1 || !data.viewport || !Array.isArray(data.boxes) || !Array.isArray(data.outside)) return false;
  const { phase, viewport, boxes, outside } = data;
  console.info("TIERRA_SANA_LAYOUT_PROBE viewport", JSON.stringify({ phase, viewport }));
  for (let index = 0; index < boxes.length; index += 3) {
    console.info("TIERRA_SANA_LAYOUT_PROBE boxes", JSON.stringify({ phase, index, boxes: boxes.slice(index, index + 3) }));
  }
  for (let index = 0; index < outside.length; index += 3) {
    console.info("TIERRA_SANA_LAYOUT_PROBE outside", JSON.stringify({ phase, index, outside: outside.slice(index, index + 3) }));
  }
  return true;
}
