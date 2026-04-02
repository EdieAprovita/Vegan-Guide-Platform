"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const { t } = useTranslation();

  useEffect(() => {
    const errorReport = {
      timestamp: new Date().toISOString(),
      digest: error.digest,
      message: error.message,
      path: typeof window !== "undefined" ? window.location.pathname : "unknown",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    };
    console.error("[GlobalError]", JSON.stringify(errorReport));
    Sentry.withScope((scope) => {
      scope.setTag("digest", error.digest ?? "unknown");
      scope.setExtra("path", typeof window !== "undefined" ? window.location.pathname : "unknown");
      scope.setExtra("userAgent", typeof navigator !== "undefined" ? navigator.userAgent : "unknown");
      scope.setExtra("timestamp", new Date().toISOString());
      Sentry.captureException(error);
    });
  }, [error]);

  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-4">
          {/* Logo mark */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-200">
              <Leaf
                className="h-10 w-10 text-white"
                aria-hidden="true"
                strokeWidth={1.5}
              />
            </div>
            <span className="text-sm font-semibold tracking-widest text-emerald-600 uppercase">
              Verde Guide
            </span>
          </div>

          {/* Error card */}
          <div
            className="bg-card border-border w-full max-w-md rounded-2xl border p-8 shadow-xl"
            role="alert"
            aria-live="assertive"
          >
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 ring-1 ring-amber-100">
                <AlertTriangle
                  className="h-8 w-8 text-amber-500"
                  aria-hidden="true"
                  strokeWidth={1.5}
                />
              </div>
            </div>

            {/* Text */}
            <div className="mb-8 flex flex-col items-center gap-3 text-center">
              <h1 className="text-foreground text-2xl font-bold tracking-tight">
                {t("errors.generic")}
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed">
                {t("errors.unexpected")}
              </p>

              {/* Digest for support reference */}
              {error.digest && (
                <p className="bg-muted text-muted-foreground/60 mt-1 rounded-md px-3 py-1.5 font-mono text-xs">
                  Ref: {error.digest}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={reset}
                className="w-full gap-2 bg-emerald-600 py-5 text-base text-white hover:bg-emerald-700 focus-visible:ring-emerald-500"
              >
                <RefreshCw className="h-5 w-5" aria-hidden="true" />
                {t("errors.retry")}
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full gap-2 border-emerald-200 py-5 text-base text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
              >
                <Link href="/">
                  <Home className="h-5 w-5" aria-hidden="true" />
                  {t("common.goHome")}
                </Link>
              </Button>
            </div>
          </div>

          <p className="text-muted-foreground/60 mt-6 text-xs">
            {t("errors.persist")}{" "}
            <Link
              href="/"
              className="text-emerald-600 underline underline-offset-2 hover:text-emerald-700"
            >
              contáctanos
            </Link>
            .
          </p>
        </div>
      </body>
    </html>
  );
}
