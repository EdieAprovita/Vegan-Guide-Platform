"use client";

import dynamic from "next/dynamic";

const RecommendationEngine = dynamic(
  () =>
    import("@/components/features/recommendations/recommendation-engine").then((mod) => ({
      default: mod.RecommendationEngine,
    })),
  {
    loading: () => (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-600" />
      </div>
    ),
    ssr: false,
  }
);

export { RecommendationEngine };
