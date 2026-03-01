"use client";

import { useEffect } from "react";
import { ShoppingBasket } from "lucide-react";
import { ErrorFallback } from "@/components/ui/error-fallback";

interface MarketsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MarketsError({ error, reset }: MarketsErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[MarketsError]", error);
    }
  }, [error]);

  return (
    <ErrorFallback
      title="Error al cargar mercados"
      description="No pudimos cargar la información de mercados. Por favor intenta de nuevo."
      icon={ShoppingBasket}
      reset={reset}
    />
  );
}
