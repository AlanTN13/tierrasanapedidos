"use server";

// Temporary observation for the protected preview. Never writes application data.
export async function reportPreviewLayout(json: string): Promise<boolean> {
  if (process.env.VERCEL_ENV !== "preview" || typeof json !== "string" || json.length > 24_000) return false;
  let report: unknown;
  try { report = JSON.parse(json); } catch { return false; }
  if (!report || typeof report !== "object" || Array.isArray(report)) return false;
  const data = report as Record<string, unknown>;
  if (data.version !== 1 || !data.viewport || !Array.isArray(data.boxes) || !Array.isArray(data.outside)) return false;
  const { version, phase, viewport, boxes, outside } = data;
  console.info("TIERRA_SANA_LAYOUT_PROBE", JSON.stringify({ version, phase, viewport, boxes, outside }));
  return true;
}
