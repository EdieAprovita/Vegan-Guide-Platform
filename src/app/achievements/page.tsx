import { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Logros | Verde Guide",
  description:
    "Descubre y desbloquea tus logros en Verde Guide. Gana insignias por explorar restaurantes veganos, compartir recetas y contribuir a la comunidad plant-based.",
  keywords: [
    "logros veganos",
    "insignias Verde Guide",
    "gamificación vegana",
    "recompensas plant-based",
    "retos veganos",
  ],
  openGraph: {
    title: "Logros | Verde Guide",
    description: "Desbloquea logros e insignias explorando la comunidad vegana en Verde Guide.",
  },
};

export default function AchievementsPage() {
  return <AchievementSystem />;
}
