type CampaignEvent = "promotion_view" | "promotion_copy" | "promotion_dismiss" | "coupon_apply" | "coupon_remove" | "whatsapp_order_intent";

// No purchase event: opening WhatsApp is an intent, never a confirmed sale.
// Ready for a separately configured GA4/GTM consumer; no personal data.
export function trackCampaign(event: CampaignEvent, data: Record<string, string | number> = {}) {
  if (typeof window === "undefined") return;
  const target = window as Window & { dataLayer?: Record<string, unknown>[] };
  target.dataLayer ??= [];
  const payload = { event, campaign_id: "noviembre_tierra_sana_2026", ...data };
  target.dataLayer.push(payload);
  window.dispatchEvent(new CustomEvent("tierra-sana:campaign", { detail: payload }));
}
