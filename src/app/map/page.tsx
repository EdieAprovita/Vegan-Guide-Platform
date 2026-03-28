import { Metadata } from "next";
import dynamic from "next/dynamic";

const MapClient = dynamic(() => import("./map-client"), {
  loading: () => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-600" />
    </div>
  ),
  ssr: false,
});

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
