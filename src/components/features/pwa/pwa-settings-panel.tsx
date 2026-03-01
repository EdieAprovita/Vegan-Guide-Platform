"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  BellOff,
  CheckCircle,
  Download,
  HardDrive,
  RefreshCw,
  Smartphone,
  Wifi,
  WifiOff,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { usePWA } from "@/hooks/usePWA";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function StatusBadge({
  ok,
  labelOk,
  labelFail,
}: {
  ok: boolean;
  labelOk: string;
  labelFail: string;
}) {
  return ok ? (
    <Badge className="gap-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
      <CheckCircle className="h-3 w-3" />
      {labelOk}
    </Badge>
  ) : (
    <Badge variant="secondary" className="gap-1">
      <XCircle className="h-3 w-3" />
      {labelFail}
    </Badge>
  );
}

function SectionRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cache size estimator (Storage API)
// ---------------------------------------------------------------------------
function useCacheSize() {
  const [sizeLabel, setSizeLabel] = useState<string>("—");

  const refresh = useCallback(async () => {
    if (typeof window === "undefined") return;
    try {
      if ("storage" in navigator && "estimate" in navigator.storage) {
        const { usage } = await navigator.storage.estimate();
        if (usage === undefined) {
          setSizeLabel("—");
          return;
        }
        const mb = usage / (1024 * 1024);
        setSizeLabel(mb < 1 ? `${Math.round(usage / 1024)} KB` : `${mb.toFixed(1)} MB`);
      }
    } catch {
      setSizeLabel("—");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { sizeLabel, refresh };
}

// ---------------------------------------------------------------------------
// Push subscription toggle (uses usePWA internally)
// ---------------------------------------------------------------------------
function PushToggle({
  subscribeToPush,
  hasPermission,
}: {
  subscribeToPush: () => Promise<PushSubscription | null>;
  hasPermission: boolean;
}) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check existing subscription on mount
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setIsSubscribed(!!sub))
      .catch(() => setIsSubscribed(false));
  }, []);

  const handleToggle = async (checked: boolean) => {
    setLoading(true);
    try {
      if (checked) {
        const sub = await subscribeToPush();
        if (sub) {
          setIsSubscribed(true);
          toast.success("Suscripción push activada");
        } else {
          toast.error("No se pudo activar la suscripción push");
        }
      } else {
        const reg = await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        if (existing) {
          await existing.unsubscribe();
        }
        setIsSubscribed(false);
        toast.success("Suscripción push desactivada");
      }
    } catch {
      toast.error("Error al cambiar la suscripción push");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
      <Switch
        id="push-toggle"
        checked={isSubscribed}
        disabled={!hasPermission || loading}
        onCheckedChange={handleToggle}
        aria-label="Alternar suscripción push"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------
export function PWASettingsPanel() {
  const {
    isPWAInstalled,
    isOnline,
    canInstall,
    installPWA,
    requestNotificationPermission,
    subscribeToPush,
    hasNotificationPermission,
    clearCache,
    updateAvailable,
    updateServiceWorker,
  } = usePWA();

  const { sizeLabel, refresh: refreshSize } = useCacheSize();

  const [notifSupported, setNotifSupported] = useState(false);
  const [permissionState, setPermissionState] =
    useState<NotificationPermission>("default");
  const [installingPWA, setInstallingPWA] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [requestingPermission, setRequestingPermission] = useState(false);

  // Initialise notification support & permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifSupported(true);
      setPermissionState(Notification.permission);
    }
  }, []);

  // Keep permissionState in sync with the hook's hasNotificationPermission
  useEffect(() => {
    if (hasNotificationPermission) {
      setPermissionState("granted");
    }
  }, [hasNotificationPermission]);

  const handleInstall = async () => {
    setInstallingPWA(true);
    try {
      await installPWA();
      toast.success("Verde Guide instalado correctamente");
    } catch {
      toast.error("No se pudo instalar la aplicación");
    } finally {
      setInstallingPWA(false);
    }
  };

  const handleRequestPermission = async () => {
    setRequestingPermission(true);
    try {
      const result = await requestNotificationPermission();
      setPermissionState(result);
      if (result === "granted") {
        toast.success("Permisos de notificación concedidos");
      } else if (result === "denied") {
        toast.error(
          "Permiso denegado. Actívalo desde la configuración del navegador."
        );
      }
    } finally {
      setRequestingPermission(false);
    }
  };

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      await clearCache();
      await refreshSize();
    } finally {
      setClearingCache(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Online status ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-emerald-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            Estado de conexión
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SectionRow label="Red">
            <StatusBadge ok={isOnline} labelOk="En línea" labelFail="Sin conexión" />
          </SectionRow>
        </CardContent>
      </Card>

      {/* ── Installation ──────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Smartphone className="h-5 w-5 text-emerald-600" />
            Instalación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SectionRow label="Estado">
            <StatusBadge
              ok={isPWAInstalled}
              labelOk="Instalada"
              labelFail="No instalada"
            />
          </SectionRow>

          {canInstall && !isPWAInstalled && (
            <>
              <Separator />
              <p className="text-sm text-gray-500">
                Instala Verde Guide como app nativa para acceso rápido, modo
                offline y notificaciones push.
              </p>
              <Button
                onClick={handleInstall}
                disabled={installingPWA}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {installingPWA ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Instalar aplicación
              </Button>
            </>
          )}

          {isPWAInstalled && (
            <p className="text-sm text-emerald-700">
              La aplicación ya está instalada en este dispositivo.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Notifications ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {hasNotificationPermission ? (
              <Bell className="h-5 w-5 text-emerald-600" />
            ) : (
              <BellOff className="h-5 w-5 text-gray-400" />
            )}
            Notificaciones push
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!notifSupported ? (
            <p className="text-sm text-gray-500">
              Tu navegador no soporta notificaciones push. Usa un navegador
              moderno para activarlas.
            </p>
          ) : (
            <>
              <SectionRow label="Permiso del navegador">
                <Badge
                  className={
                    permissionState === "granted"
                      ? "gap-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                      : permissionState === "denied"
                        ? "gap-1 bg-red-100 text-red-700 hover:bg-red-100"
                        : "gap-1"
                  }
                  variant={
                    permissionState === "default" ? "secondary" : "default"
                  }
                >
                  {permissionState === "granted" ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      Concedido
                    </>
                  ) : permissionState === "denied" ? (
                    <>
                      <XCircle className="h-3 w-3" />
                      Denegado
                    </>
                  ) : (
                    "Sin configurar"
                  )}
                </Badge>
              </SectionRow>

              {permissionState === "default" && (
                <>
                  <Separator />
                  <Button
                    onClick={handleRequestPermission}
                    disabled={requestingPermission}
                    className="w-full"
                    variant="outline"
                  >
                    {requestingPermission && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Solicitar permiso de notificaciones
                  </Button>
                </>
              )}

              {permissionState === "denied" && (
                <p className="text-sm text-red-600">
                  El permiso fue denegado. Para activarlo, ve a la configuración
                  de tu navegador y permite las notificaciones para este sitio.
                </p>
              )}

              {permissionState === "granted" && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="push-toggle"
                      className="cursor-pointer text-sm font-medium"
                    >
                      Suscripción push activa
                    </Label>
                    <PushToggle
                      subscribeToPush={subscribeToPush}
                      hasPermission={hasNotificationPermission}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Cache management ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <HardDrive className="h-5 w-5 text-emerald-600" />
            Caché y almacenamiento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SectionRow label="Espacio usado">
            <Badge variant="outline" className="font-mono text-xs">
              {sizeLabel}
            </Badge>
          </SectionRow>

          <Separator />

          <p className="text-sm text-gray-500">
            Limpiar la caché libera espacio pero puede ralentizar la primera
            carga y desactivar el modo offline temporalmente.
          </p>
          <Button
            variant="outline"
            onClick={handleClearCache}
            disabled={clearingCache}
            className="w-full"
          >
            {clearingCache ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <HardDrive className="mr-2 h-4 w-4" />
            )}
            Limpiar caché
          </Button>
        </CardContent>
      </Card>

      {/* ── SW Update ─────────────────────────────────────────────────────── */}
      {updateAvailable && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-amber-800">
              <RefreshCw className="h-5 w-5" />
              Actualización disponible
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-amber-700">
              Hay una nueva versión de Verde Guide disponible. Actualiza para
              obtener las últimas mejoras y correcciones.
            </p>
            <Button
              onClick={updateServiceWorker}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar ahora
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
