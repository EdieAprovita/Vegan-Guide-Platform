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
    console.log("[WebVitals]", entry);
    return;
  }

  // TODO: replace with real analytics integration (e.g. Plausible, PostHog, Datadog RUM)
  // Example:
  //   fetch("/api/analytics/web-vitals", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(entry),
  //   });
  console.log("[WebVitals]", entry);
}

export function WebVitalsReporter(): null {
  useReportWebVitals(reportMetric);
  return null;
}
