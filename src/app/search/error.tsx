"use client";

import { useEffect } from "react";
import { SearchX } from "lucide-react";
import { ErrorFallback } from "@/components/ui/error-fallback";

interface SearchErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SearchError({ error, reset }: SearchErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[SearchError]", error);
    }
  }, [error]);

  return (
    <ErrorFallback
      title="Error en la búsqueda"
      description="No pudimos completar tu búsqueda. Por favor intenta de nuevo."
      icon={SearchX}
      reset={reset}
    />
  );
}
