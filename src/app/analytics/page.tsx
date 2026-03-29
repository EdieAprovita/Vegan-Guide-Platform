import { Metadata } from "next";
import { AnalyticsDashboard } from "./_analytics-loader";

export const metadata: Metadata = {
  title: "Analíticas | Verde Guide",
  description:
    "Panel de analíticas de Verde Guide. Consulta estadísticas de uso, tendencias de la comunidad vegana y métricas de la plataforma.",
  keywords: [
    "analíticas veganas",
    "estadísticas Verde Guide",
    "métricas plataforma vegana",
    "dashboard vegano",
  ],
  openGraph: {
    title: "Analíticas | Verde Guide",
    description: "Consulta las estadísticas y tendencias de la comunidad vegana en Verde Guide.",
  },
};

export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
