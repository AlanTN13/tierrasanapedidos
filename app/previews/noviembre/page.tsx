import { notFound } from "next/navigation";
import { CampaignPreview } from "@/components/campaign-preview";

export default function NovemberPreviewPage() {
  if (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "preview") notFound();
  return <CampaignPreview />;
}
