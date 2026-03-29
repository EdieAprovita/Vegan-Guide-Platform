import { Metadata } from "next";
import { MapClient } from "./_map-loader";

export const metadata: Metadata = {
  title: "Mapa Vegano | Verde Guide",
  description:
    "Explora el mapa interactivo de Verde Guide y descubre restaurantes veganos, mercados orgánicos y doctores plant-based cerca de ti. Encuentra lugares veganos en tu ciudad.",
  keywords: [
    "mapa vegano",
    "restaurantes veganos cerca",
    "mapa plant-based",
    "lugares veganos",
    "mapa mercados orgánicos",
    "directorio vegano mapa",
  ],
  openGraph: {
    title: "Mapa Vegano | Verde Guide",
    description:
      "Explora el mapa interactivo y descubre restaurantes, mercados y profesionales veganos cerca de ti.",
  },
};

export default function MapPage() {
  return <MapClient />;
}
