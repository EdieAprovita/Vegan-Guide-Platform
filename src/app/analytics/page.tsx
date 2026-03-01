import { Metadata } from "next";
import dynamic from "next/dynamic";

const AnalyticsDashboard = dynamic(
  () =>
    import("@/components/features/analytics/analytics-dashboard").then((mod) => ({
      default: mod.AnalyticsDashboard,
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
    description:
      "Consulta las estadísticas y tendencias de la comunidad vegana en Verde Guide.",
  },
};

export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
