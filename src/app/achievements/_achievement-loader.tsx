"use client";

import dynamic from "next/dynamic";

const AchievementSystem = dynamic(
  () =>
    import("@/components/features/gamification/achievement-system").then((mod) => ({
      default: mod.AchievementSystem,
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

export { AchievementSystem };
