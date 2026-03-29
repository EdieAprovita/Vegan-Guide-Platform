import { Metadata } from "next";
import { RecommendationEngine } from "./_recommendation-loader";

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
