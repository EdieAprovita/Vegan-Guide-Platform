"use client";

import { useTranslation } from "@/lib/i18n";

/**
 * LoadingSpinner
 *
 * Full-screen loading indicator that uses the active locale to show the
 * correct "loading" label. Intended for use inside Next.js loading.tsx files.
 */
export function LoadingSpinner() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white">
      <div
        className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"
        role="status"
        aria-label={t("common.loading")}
      />
      <p className="text-sm font-medium tracking-wide text-emerald-700">
        {t("common.loading")}
      </p>
    </div>
  );
}
