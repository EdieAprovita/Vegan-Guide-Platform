"use client";

import { useLocale, useTranslation } from "@/lib/i18n";

/**
 * LanguageToggle
 *
 * A minimal accessible button that switches the active locale between "es" and "en".
 * Place it alongside ThemeToggle in the site header.
 */
export function LanguageToggle() {
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation();

  const nextLocale = locale === "es" ? "en" : "es";
  const label = locale === "es" ? "ES" : "EN";

  return (
    <button
      type="button"
      onClick={() => setLocale(nextLocale)}
      aria-label={t("a11y.changeLanguage")}
      title={t("a11y.changeLanguage")}
      className="text-foreground/70 hover:text-primary focus-visible:ring-ring/50 inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-md px-2 py-1 text-xs font-semibold tracking-wider transition-colors duration-200 focus-visible:ring-[3px] focus-visible:outline-none"
    >
      {label}
    </button>
  );
}
