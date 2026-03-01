"use client";

import { useEffect } from "react";
import { Stethoscope } from "lucide-react";
import { ErrorFallback } from "@/components/ui/error-fallback";

interface DoctorsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DoctorsError({ error, reset }: DoctorsErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[DoctorsError]", error);
    }
  }, [error]);

  return (
    <ErrorFallback
      title="Error al cargar doctores"
      description="No pudimos cargar la información de doctores. Por favor intenta de nuevo."
      icon={Stethoscope}
      reset={reset}
    />
  );
}
