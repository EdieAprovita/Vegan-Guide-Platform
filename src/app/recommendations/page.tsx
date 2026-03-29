import { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Recomendaciones | Verde Guide",
  description:
    "Descubre recomendaciones personalizadas de restaurantes veganos, mercados, recetas y profesionales de salud plant-based adaptadas a tus preferencias.",
  keywords: [
    "recomendaciones veganas",
    "sugerencias plant-based",
    "restaurantes veganos recomendados",
    "guía vegana personalizada",
    "Verde Guide recomendaciones",
  ],
  openGraph: {
    title: "Recomendaciones | Verde Guide",
    description:
      "Descubre recomendaciones personalizadas de lugares y recursos veganos adaptados a tus gustos.",
  },
};

export default function RecommendationsPage() {
  return <RecommendationEngine />;
}
