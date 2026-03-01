"use client";

import { useEffect } from "react";
import { Utensils } from "lucide-react";
import { ErrorFallback } from "@/components/ui/error-fallback";

interface RestaurantsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RestaurantsError({ error, reset }: RestaurantsErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[RestaurantsError]", error);
    }
  }, [error]);

  return (
    <ErrorFallback
      title="Error al cargar restaurantes"
      description="No pudimos cargar la información de restaurantes. Intenta de nuevo."
      icon={Utensils}
      reset={reset}
    />
  );
}
