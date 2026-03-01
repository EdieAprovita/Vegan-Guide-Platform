"use client";

import { useEffect } from "react";
import { MapPin } from "lucide-react";
import { ErrorFallback } from "@/components/ui/error-fallback";

interface MapErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MapError({ error, reset }: MapErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[MapError]", error);
    }
  }, [error]);

  return (
    <ErrorFallback
      title="Error al cargar el mapa"
      description="No pudimos cargar el mapa. Verifica tu conexión e intenta de nuevo."
      icon={MapPin}
      reset={reset}
    />
  );
}
