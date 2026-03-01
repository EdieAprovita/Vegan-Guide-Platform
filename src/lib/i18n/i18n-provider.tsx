"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { translations, type Locale, type TranslationKeys } from "./translations";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Dot-notation paths for the Spanish translation object (used as the canonical shape) */
type DotPath<T, Prefix extends string = ""> = {
  [K in keyof T]: T[K] extends Record<string, unknown>
    ? DotPath<T[K], Prefix extends "" ? `${string & K}` : `${Prefix}.${string & K}`>
    : Prefix extends ""
    ? `${string & K}`
    : `${Prefix}.${string & K}`;
}[keyof T];

export type TranslationPath = DotPath<TranslationKeys>;

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const LocaleContext = createContext<LocaleContextValue>({
  locale: "es",
  setLocale: () => undefined,
});

// ---------------------------------------------------------------------------
// Storage helpers (safe for SSR)
// ---------------------------------------------------------------------------

const STORAGE_KEY = "vg-locale";

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "es";
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "en" || stored === "es" ? stored : "es";
}

function writeStoredLocale(locale: Locale): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, locale);
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Start with the default "es" to avoid SSR mismatch; sync with localStorage
  // on the client inside useEffect.
  const [locale, setLocaleState] = useState<Locale>("es");

  useEffect(() => {
    setLocaleState(readStoredLocale());
  }, []);

  const setLocale = useCallback((next: Locale) => {
    writeStoredLocale(next);
    setLocaleState(next);
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/** Returns the current locale and a setter that persists to localStorage. */
export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}

/**
 * Returns a `t` function that resolves dot-notation translation keys.
 *
 * @example
 * const { t } = useTranslation();
 * t("nav.home")      // "Inicio" (es) | "Home" (en)
 * t("common.loading") // "Cargando..." (es)
 */
export function useTranslation() {
  const { locale } = useLocale();

  const t = useCallback(
    (key: string): string => {
      const dict = translations[locale] as Record<string, unknown>;
      const parts = key.split(".");
      let current: unknown = dict;

      for (const part of parts) {
        if (current == null || typeof current !== "object") {
          if (process.env.NODE_ENV === "development") {
            console.warn(`[i18n] Missing key: "${key}" (locale: ${locale})`);
          }
          return key;
        }
        current = (current as Record<string, unknown>)[part];
      }

      if (typeof current === "string") return current;

      if (process.env.NODE_ENV === "development") {
        console.warn(`[i18n] Key did not resolve to a string: "${key}" (locale: ${locale})`);
      }
      return key;
    },
    [locale],
  );

  return { t, locale };
}
