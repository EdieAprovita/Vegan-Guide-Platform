"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

// urlBase64ToUint8Array is required to convert the VAPID key from the env
// variable (base64url) into the Uint8Array format expected by the Push API.
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePWA() {
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Keep a stable reference to the waiting SW so we can call skipWaiting
  const waitingWorkerRef = useRef<ServiceWorker | null>(null);

  // ---------------------------------------------------------------------------
  // Service Worker registration + update detection
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      // In dev: unregister any stale SW to prevent serving cached assets
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().catch(() => {
            // Unregister is best-effort; ignore errors
          });
        }
      });
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // Detect an already-waiting SW (page was open while SW updated)
        if (registration.waiting) {
          waitingWorkerRef.current = registration.waiting;
          setUpdateAvailable(true);
        }

        // Detect a newly-installed SW waiting to activate
        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) return;

          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              waitingWorkerRef.current = installing;
              setUpdateAvailable(true);
            }
          });
        });
      })
      .catch((err) => {
        console.error("SW registration failed:", err);
      });

    // When the controlling SW changes (after skipWaiting), reload the page
    // so users get the latest version.
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Online / offline detection with toasts
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Conexión restaurada", {
        description: "Estás en línea de nuevo.",
        duration: 3000,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("Sin conexión", {
        description: "Estás navegando sin internet. Algunas funciones pueden no estar disponibles.",
        duration: 5000,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // PWA install prompt detection
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if already running as a standalone PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsPWAInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsPWAInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Notification permission — sync initial state
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setHasNotificationPermission(Notification.permission === "granted");
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const installPWA = useCallback(async (): Promise<void> => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsPWAInstalled(true);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "denied";
    }
    try {
      const result = await Notification.requestPermission();
      setHasNotificationPermission(result === "granted");
      return result;
    } catch {
      return "denied";
    }
  }, []);

  const subscribeToPush = useCallback(async (): Promise<PushSubscription | null> => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      return null;
    }

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      console.error("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set. Cannot subscribe to push.");
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
      });
      return subscription;
    } catch (err) {
      console.error("Failed to subscribe to push notifications:", err);
      return null;
    }
  }, []);

  const clearCache = useCallback(async (): Promise<void> => {
    if (typeof window === "undefined" || !("caches" in window)) return;
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      toast.success("Caché limpiada", {
        description: "La caché de la aplicación ha sido borrada correctamente.",
      });
    } catch {
      toast.error("Error al limpiar la caché");
    }
  }, []);

  const updateServiceWorker = useCallback((): void => {
    const waiting = waitingWorkerRef.current;
    if (!waiting) return;
    // Tell the waiting SW to skip waiting and become active.
    // The "controllerchange" listener registered above will reload the page.
    waiting.postMessage({ type: "SKIP_WAITING" });
  }, []);

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  return {
    isPWAInstalled,
    isOnline,
    canInstall: !!deferredPrompt,
    installPWA,
    requestNotificationPermission,
    subscribeToPush,
    hasNotificationPermission,
    clearCache,
    updateAvailable,
    updateServiceWorker,
  };
}
