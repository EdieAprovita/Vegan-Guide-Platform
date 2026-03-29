"use client";

import dynamic from "next/dynamic";

const AnalyticsDashboard = dynamic(
  () =>
    import("@/components/features/analytics/analytics-dashboard").then((mod) => ({
      default: mod.AnalyticsDashboard,
    })),
  {
    loading: () => (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    ),
    ssr: false,
  }
);

export { AnalyticsDashboard };
