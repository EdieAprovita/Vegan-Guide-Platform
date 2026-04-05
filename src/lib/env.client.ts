/**
 * Client-side environment variables.
 *
 * Only NEXT_PUBLIC_* vars are available here — they are inlined by Next.js at
 * build time. This module is Zod-free so it adds zero bundle weight.
 *
 * In production a missing NEXT_PUBLIC_API_URL causes a build-time error
 * (Next.js inlines `undefined` and the throw fires on first import).
 * In development/test the localhost fallback is applied so local dev works
 * without a full .env file.
 */

function getApiUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_URL;

  if (!value) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "[env] NEXT_PUBLIC_API_URL is required in production but was not set at build time."
      );
    }
    // Dev / test fallback
    return "http://localhost:5001/api/v1";
  }

  return value;
}

export const clientEnv = {
  NEXT_PUBLIC_API_URL: getApiUrl(),
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
} as const;

export type ClientEnv = typeof clientEnv;
