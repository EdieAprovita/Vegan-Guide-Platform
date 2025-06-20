import { PushNotifications } from "@/components/features/pwa/push-notifications";

export default function PWASettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            PWA Settings
          </h1>
          <p className="text-gray-600">
            Configure Progressive Web App features and push notifications
          </p>
        </div>
        
        <PushNotifications />
      </div>
    </div>
  );
} 