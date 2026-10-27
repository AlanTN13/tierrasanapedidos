"use client";

import Script from "next/script";
import { GOOGLE_ANALYTICS_BOOTSTRAP } from "@/lib/google-analytics";

export function GoogleAnalytics() {
  return (
    <Script id="tierra-sana-google-analytics" strategy="afterInteractive">
      {GOOGLE_ANALYTICS_BOOTSTRAP}
    </Script>
  );
}
