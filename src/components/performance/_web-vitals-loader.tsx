"use client";

import dynamic from "next/dynamic";

export const WebVitalsReporter = dynamic(
  () => import("@/components/performance/web-vitals-reporter").then((mod) => mod.WebVitalsReporter),
  { ssr: false }
);
