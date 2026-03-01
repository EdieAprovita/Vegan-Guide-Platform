"use client";

import { useEffect } from "react";
import { Building2 } from "lucide-react";
import { ErrorFallback } from "@/components/ui/error-fallback";

interface BusinessesErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BusinessesError({ error, reset }: BusinessesErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[BusinessesError]", error);
    }
  }, [error]);

  return (
    <ErrorFallback
      title="Error al cargar negocios"
      description="No pudimos cargar la información de negocios. Por favor intenta de nuevo."
      icon={Building2}
      reset={reset}
    />
  );
}
