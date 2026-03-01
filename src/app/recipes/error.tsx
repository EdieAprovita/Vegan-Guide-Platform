"use client";

import { useEffect } from "react";
import { ChefHat } from "lucide-react";
import { ErrorFallback } from "@/components/ui/error-fallback";

interface RecipesErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RecipesError({ error, reset }: RecipesErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[RecipesError]", error);
    }
  }, [error]);

  return (
    <ErrorFallback
      title="Error al cargar recetas"
      description="No pudimos cargar las recetas. Por favor intenta de nuevo."
      icon={ChefHat}
      reset={reset}
    />
  );
}
