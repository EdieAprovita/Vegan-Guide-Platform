"use client";

import { useState, useEffect } from "react";
import { env } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Bell,
  BellOff,
  Settings,
  CheckCircle,
  XCircle,
  MessageSquare,
  ChefHat,
  Star,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

// Converts a base64url VAPID public key to the ArrayBuffer that pushManager.subscribe() requires.
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer as ArrayBuffer;
}

interface NotificationSettings {
  enabled: boolean;
  newRestaurants: boolean;
  newRecipes: boolean;
  communityUpdates: boolean;
  healthTips: boolean;
  promotions: boolean;
}

export function PushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    newRestaurants: true,
    newRecipes: true,
    communityUpdates: true,
    healthTips: false,
    promotions: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkSupport();
  }, []);

  const checkSupport = () => {
    const supported = "serviceWorker" in navigator && "PushManager" in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
    }
  };

  /**
   * Wraps subscribeToPush/unsubscribeFromPush for use in the synchronous
   * onCheckedChange handler. Errors are already surfaced via toast inside each
   * function, so we only need to swallow the rejection here to prevent an
   * unhandled-promise-rejection warning from the event loop.
   */
  const handleToggleSubscription = (checked: boolean) => {
    if (checked) {
      subscribeToPush().catch(() => {
        // toast already shown inside subscribeToPush
      });
    } else {
      unsubscribeFromPush().catch(() => {
        // toast already shown inside unsubscribeFromPush
      });
    }
  };

  const requestPermission = async () => {
    setLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        await subscribeToPush();
        toast.success("Push notifications enabled and saved!");
      } else if (result === "denied") {
        toast.error("Permission denied for push notifications");
      } else {
        // User dismissed the prompt ("default") — keep UI unchanged
        toast("You can enable notifications later from your browser settings.");
      }
    } catch {
      toast.error("Failed to enable push notifications");
    } finally {
      setLoading(false);
    }
  };

  const subscribeToPush = async () => {
    const vapidKey = env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      console.error("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set");
      toast.error("Push notifications are not configured. Contact support.");
      throw new Error("VAPID public key is not configured");
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      setSubscription(sub);
      // Build snapshot before setSettings so sendSubscriptionToServer gets the
      // updated value — React state updates are async and the closure would otherwise
      // capture the stale pre-update settings object.
      const updatedSettings = { ...settings, enabled: true };
      setSettings(updatedSettings);

      // Send subscription to backend — propagate errors so the caller can react
      await sendSubscriptionToServer(sub, updatedSettings);
    } catch (err) {
      console.error("Failed to subscribe to push notifications", err);
      toast.error("Failed to subscribe to push notifications");
      throw err;
    }
  };

  const unsubscribeFromPush = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe();
        setSubscription(null);
        setSettings((prev) => ({ ...prev, enabled: false }));
        toast.success("Push notifications disabled");
      }
    } catch {
      toast.error("Failed to disable push notifications");
    }
  };

  const sendSubscriptionToServer = async (
    sub: PushSubscription,
    settingsSnapshot: NotificationSettings
  ) => {
    const response = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscription: sub.toJSON(),
        settings: settingsSnapshot,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const message = (data as { message?: string }).message ?? "Failed to save subscription";
      throw new Error(message);
    }
  };

  const updateSettings = async (key: keyof NotificationSettings, value: boolean) => {
    const previousSettings = settings;
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    if (subscription) {
      try {
        const response = await fetch("/api/push/settings", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newSettings),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          const message = (data as { message?: string }).message ?? "Failed to update settings";
          throw new Error(message);
        }

        toast.success("Notification settings updated");
      } catch (err) {
        const errorMessage =
          err instanceof Error && err.message ? err.message : "Failed to update settings";
        toast.error(errorMessage);
        // Revert optimistic update using the snapshot captured before the write
        setSettings(previousSettings);
      }
    }
  };

  const sendTestNotification = () => {
    if (permission === "granted") {
      new Notification("Vegan Guide", {
        body: "This is a test notification from Vegan Guide!",
        icon: "/logo.svg",
        badge: "/logo.svg",
        tag: "test-notification",
      });
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5 text-gray-400" />
            Push Notifications Not Supported
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Your browser doesn&apos;t support push notifications. Please use a modern browser.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notification Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Browser Support</span>
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="mr-1 h-3 w-3" />
              Supported
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Permission Status</span>
            <Badge
              variant={permission === "granted" ? "default" : "secondary"}
              className={permission === "granted" ? "bg-green-100 text-green-800" : ""}
            >
              {permission === "granted" ? (
                <>
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Granted
                </>
              ) : permission === "denied" ? (
                <>
                  <XCircle className="mr-1 h-3 w-3" />
                  Denied
                </>
              ) : (
                "Default"
              )}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Subscription Status</span>
            <Badge
              variant={subscription ? "default" : "secondary"}
              className={subscription ? "bg-green-100 text-green-800" : ""}
            >
              {subscription ? (
                <>
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Active
                </>
              ) : (
                <>
                  <XCircle className="mr-1 h-3 w-3" />
                  Inactive
                </>
              )}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Permission Request */}
      {permission === "default" && (
        <Card>
          <CardHeader>
            <CardTitle>Enable Push Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Get notified about new vegan restaurants, recipes, and community updates.
            </p>
            <Button onClick={requestPermission} disabled={loading} className="w-full">
              {loading ? "Enabling..." : "Enable Notifications"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Settings */}
      {permission === "granted" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4" />
                <Label htmlFor="enabled">Enable Push Notifications</Label>
              </div>
              <Switch
                id="enabled"
                checked={settings.enabled}
                onCheckedChange={handleToggleSubscription}
              />
            </div>

            {settings.enabled && (
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ChefHat className="h-4 w-4" />
                    <Label htmlFor="restaurants">New Restaurants</Label>
                  </div>
                  <Switch
                    id="restaurants"
                    checked={settings.newRestaurants}
                    onCheckedChange={(checked) => updateSettings("newRestaurants", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Star className="h-4 w-4" />
                    <Label htmlFor="recipes">New Recipes</Label>
                  </div>
                  <Switch
                    id="recipes"
                    checked={settings.newRecipes}
                    onCheckedChange={(checked) => updateSettings("newRecipes", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4" />
                    <Label htmlFor="community">Community Updates</Label>
                  </div>
                  <Switch
                    id="community"
                    checked={settings.communityUpdates}
                    onCheckedChange={(checked) => updateSettings("communityUpdates", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4" />
                    <Label htmlFor="health">Health Tips</Label>
                  </div>
                  <Switch
                    id="health"
                    checked={settings.healthTips}
                    onCheckedChange={(checked) => updateSettings("healthTips", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4" />
                    <Label htmlFor="promotions">Promotions & Offers</Label>
                  </div>
                  <Switch
                    id="promotions"
                    checked={settings.promotions}
                    onCheckedChange={(checked) => updateSettings("promotions", checked)}
                  />
                </div>
              </div>
            )}

            {settings.enabled && (
              <div className="border-t pt-4">
                <Button variant="outline" onClick={sendTestNotification} className="w-full">
                  Send Test Notification
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Help */}
      <Card>
        <CardHeader>
          <CardTitle>About Push Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Get notified about new vegan restaurants in your area</p>
            <p>• Discover fresh recipes and cooking tips</p>
            <p>• Stay updated with community posts and discussions</p>
            <p>• Receive personalized health and nutrition advice</p>
            <p>• Learn about special offers and promotions</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
