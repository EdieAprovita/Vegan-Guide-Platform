import { PWASettingsPanel } from "@/components/features/pwa/pwa-settings-panel";

export const metadata = {
  title: "Configuración PWA — Verde Guide",
  description:
    "Gestiona la instalación, notificaciones push, caché y actualizaciones de la aplicación.",
};

export default function PWASettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Configuración de la app</h1>
          <p className="text-gray-600">
            Gestiona la instalación, notificaciones push, almacenamiento en caché y actualizaciones
            de Verde Guide.
          </p>
        </div>

        <PWASettingsPanel />
      </div>
    </div>
  );
}
