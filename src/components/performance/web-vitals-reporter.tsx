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

/** Thresholds above which a metric is considered degraded (same units as metric.value). */
const POOR_THRESHOLDS: Partial<Record<string, number>> = {
  LCP: 2500,
  FID: 200,
  INP: 200,
  CLS: 0.1,
  TTFB: 800,
};

function reportMetric(metric: VitalMetric): void {
  const structuredLog = {
    type: "web-vital",
    metric: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    path: typeof window !== "undefined" ? window.location.pathname : "unknown",
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log("[WebVitals]", structuredLog);
  } else {
    // Structured JSON log for production log aggregators (e.g. CloudWatch, Datadog)
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(structuredLog));
  }

  // Threshold alert — fires in all environments so degradations surface during QA too
  const threshold = POOR_THRESHOLDS[metric.name];
  if (threshold !== undefined && metric.value > threshold) {
    // eslint-disable-next-line no-console
    console.warn(
      `[WebVitals] ${metric.name} exceeded threshold: ${metric.value} > ${threshold}`,
      structuredLog,
    );
  }

  // Only send to analytics endpoint in production when one is configured
  if (process.env.NODE_ENV !== "production") return;

  const endpoint = process.env.NEXT_PUBLIC_WEB_VITALS_ENDPOINT;
  if (!endpoint) return;

  const body = JSON.stringify(structuredLog);

  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    navigator.sendBeacon(endpoint, new Blob([body], { type: "application/json" }));
    return;
  }

  void fetch(endpoint, {
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
