"use client";

import dynamic from "next/dynamic";

const ReviewsManagement = dynamic(
  () =>
    import("@/components/features/reviews/reviews-management").then((mod) => ({
      default: mod.ReviewsManagement,
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

export { ReviewsManagement };
