"use client";

import Link from "next/link";
import { type LucideIcon, AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface ErrorFallbackProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  reset: () => void;
  className?: string;
}

export function ErrorFallback({
  title,
  description,
  icon: Icon = AlertTriangle,
  reset,
  className,
}: ErrorFallbackProps) {
  const { t } = useTranslation();

  const resolvedTitle = title ?? t("errors.generic");
  const resolvedDescription = description ?? t("errors.unexpected");

  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center px-4 py-12",
        className,
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
        {/* Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-100">
          <Icon
            className="h-8 w-8 text-emerald-600"
            aria-hidden="true"
            strokeWidth={1.5}
          />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight text-gray-900">
            {resolvedTitle}
          </h2>
          <p className="text-sm leading-relaxed text-gray-500">{resolvedDescription}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={reset}
            className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {t("common.retry")}
          </Button>

          <Button
            asChild
            variant="outline"
            className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
          >
            <Link href="/">
              <Home className="h-4 w-4" aria-hidden="true" />
              {t("common.goHome")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
