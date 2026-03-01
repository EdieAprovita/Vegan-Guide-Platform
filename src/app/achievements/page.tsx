import { Metadata } from "next";
import { AchievementSystem } from "@/components/features/gamification/achievement-system";

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
    description:
      "Desbloquea logros e insignias explorando la comunidad vegana en Verde Guide.",
  },
};

export default function AchievementsPage() {
  return <AchievementSystem />;
}
