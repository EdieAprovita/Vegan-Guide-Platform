"use client";

import { useEffect } from "react";
import { Users } from "lucide-react";
import { ErrorFallback } from "@/components/ui/error-fallback";

interface CommunityErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CommunityError({ error, reset }: CommunityErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[CommunityError]", error);
    }
  }, [error]);

  return (
    <ErrorFallback
      title="Error al cargar la comunidad"
      description="No pudimos cargar el contenido de la comunidad. Por favor intenta de nuevo."
      icon={Users}
      reset={reset}
    />
  );
}
