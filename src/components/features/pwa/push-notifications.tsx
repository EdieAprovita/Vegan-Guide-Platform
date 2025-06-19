"use client";

import { useState, useEffect } from "react";
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
  MapPin
} from "lucide-react";
import { toast } from "sonner";

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

  const requestPermission = async () => {
    setLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === "granted") {
        await subscribeToPush();
        toast.success("Push notifications enabled!");
      } else {
        toast.error("Permission denied for push notifications");
      }
    } catch (error) {
      toast.error("Failed to enable push notifications");
    } finally {
      setLoading(false);
    }
  };

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });
      
      setSubscription(subscription);
      setSettings(prev => ({ ...prev, enabled: true }));
      
      // Send subscription to backend
      await sendSubscriptionToServer(subscription);
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
      toast.error("Failed to subscribe to push notifications");
    }
  };

  const unsubscribeFromPush = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe();
        setSubscription(null);
        setSettings(prev => ({ ...prev, enabled: false }));
        toast.success("Push notifications disabled");
      }
    } catch (error) {
      toast.error("Failed to disable push notifications");
    }
  };

  const sendSubscriptionToServer = async (subscription: PushSubscription) => {
    try {
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          settings,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save subscription");
      }
    } catch (error) {
      console.error("Failed to send subscription to server:", error);
    }
  };

  const updateSettings = async (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    if (subscription) {
      try {
        await fetch("/api/push/settings", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newSettings),
        });
        toast.success("Notification settings updated");
      } catch (error) {
        toast.error("Failed to update settings");
      }
    }
  };

  const sendTestNotification = async () => {
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
            Your browser doesn't support push notifications. Please use a modern browser.
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
              <CheckCircle className="h-3 w-3 mr-1" />
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
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Granted
                </>
              ) : permission === "denied" ? (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
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
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
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
            <p className="text-sm text-gray-600 mb-4">
              Get notified about new vegan restaurants, recipes, and community updates.
            </p>
            <Button 
              onClick={requestPermission} 
              disabled={loading}
              className="w-full"
            >
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
                onCheckedChange={(checked) => {
                  if (checked) {
                    subscribeToPush();
                  } else {
                    unsubscribeFromPush();
                  }
                }}
              />
            </div>

            {settings.enabled && (
              <div className="space-y-3 pt-4 border-t">
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
              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={sendTestNotification}
                  className="w-full"
                >
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