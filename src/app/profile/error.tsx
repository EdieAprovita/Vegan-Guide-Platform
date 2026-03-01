"use client";

import { useEffect } from "react";
import { UserX } from "lucide-react";
import { ErrorFallback } from "@/components/ui/error-fallback";

interface ProfileErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProfileError({ error, reset }: ProfileErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[ProfileError]", error);
    }
  }, [error]);

  return (
    <ErrorFallback
      title="Error al cargar tu perfil"
      description="No pudimos cargar la información de tu perfil. Por favor intenta de nuevo."
      icon={UserX}
      reset={reset}
    />
  );
}
