"use client";

import { useReportWebVitals } from "next/web-vitals";

/**
 * Subset of the web-vitals Metric shape that is always present at runtime.
 * `rating` and `delta` are available in web-vitals v3+ (bundled by Next.js 14).
 * We extend the base type rather than importing Metric directly because
 * next/dist/compiled/web-vitals ships no .d.ts file in this version.
 */
interface VitalMetric {
  name: string;
  value: number;
  id: string;
  delta?: number;
  rating?: "good" | "needs-improvement" | "poor";
}

function reportMetric(metric: VitalMetric): void {
  const entry = {
    name: metric.name,
    value: metric.value,
    id: metric.id,
    delta: metric.delta,
    rating: metric.rating,
  };

  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log("[WebVitals]", entry);
    return;
  }

  // Use sendBeacon/fetch instead of console.log — SWC strips console.* in production
  const body = JSON.stringify(entry);

  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    navigator.sendBeacon("/api/analytics/web-vitals", new Blob([body], { type: "application/json" }));
    return;
  }

  void fetch("/api/analytics/web-vitals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Swallow errors — analytics must not impact user experience
  });
}

export function WebVitalsReporter(): null {
  useReportWebVitals(reportMetric);
  return null;
}
