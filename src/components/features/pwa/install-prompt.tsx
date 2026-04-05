"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, X, CheckCircle, Wifi, WifiOff } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";
import { toast } from "sonner";

const DISMISS_KEY = "pwa-prompt-dismissed-at";
const DISMISS_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function isDismissedWithinTTL(): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const dismissedAt = parseInt(raw, 10);
  return !isNaN(dismissedAt) && Date.now() - dismissedAt < DISMISS_TTL_MS;
}

export function InstallPrompt() {
  const { isPWAInstalled, isOnline, canInstall, installPWA } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  // Initialise from localStorage so dismissal survives page reloads (with 30-day TTL)
  const [dismissed, setDismissed] = useState<boolean>(() => isDismissedWithinTTL());

  useEffect(() => {
    // Show prompt if PWA can be installed and user hasn't dismissed it within TTL
    if (canInstall && !isPWAInstalled && !dismissed) {
      // Delay showing the prompt to avoid showing it immediately
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [canInstall, isPWAInstalled, dismissed]);

  const handleInstall = async () => {
    try {
      await installPWA();
      setShowPrompt(false);
      // Clean up dismissal record on successful install — no longer needed
      localStorage.removeItem(DISMISS_KEY);
      toast.success("Vegan Guide installed successfully!");
    } catch {
      toast.error("Failed to install app");
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    // Store timestamp so we can re-show after 30 days
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  const handleClose = () => {
    setShowPrompt(false);
  };

  // Don't show if already installed or dismissed
  if (isPWAInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-4 left-4 z-50 md:right-4 md:left-auto md:w-80">
      <Card className="border-green-200 bg-green-50/50 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Smartphone className="h-5 w-5 text-green-600" />
              Install Vegan Guide
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleClose} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {isOnline ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span>Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span>Offline</span>
              </>
            )}
          </div>

          <p className="text-sm text-gray-600">
            Install Vegan Guide as a native app for a better experience:
          </p>

          <ul className="space-y-1 text-xs text-gray-500">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Faster access from home screen
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Works offline
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Push notifications
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Native app experience
            </li>
          </ul>

          <div className="flex gap-2">
            <Button onClick={handleInstall} className="flex-1 bg-green-600 hover:bg-green-700">
              <Download className="mr-2 h-4 w-4" />
              Install
            </Button>
            <Button variant="outline" onClick={handleDismiss} className="text-gray-500">
              Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
