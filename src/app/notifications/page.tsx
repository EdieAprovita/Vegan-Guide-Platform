import { Metadata } from "next";
import { NotificationCenter } from "@/components/features/notifications/notification-center";

export const metadata: Metadata = {
  title: "Notificaciones | Verde Guide",
  description:
    "Consulta tus notificaciones en Verde Guide. Mantente al día con las novedades de la comunidad vegana, nuevos lugares y actualizaciones de la plataforma.",
  keywords: ["notificaciones", "alertas veganas", "Verde Guide", "actualizaciones"],
  openGraph: {
    title: "Notificaciones | Verde Guide",
    description: "Mantente al día con todas las novedades y actividad en Verde Guide.",
  },
};

export default function NotificationsPage() {
  return <NotificationCenter />;
}
