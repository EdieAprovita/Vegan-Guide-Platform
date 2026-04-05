/**
 * Validated environment variables.
 *
 * Import `env` instead of accessing `process.env` directly so that:
 *  - Missing / malformed variables cause a clear startup error (fail-fast).
 *  - All consumers get a fully-typed object instead of `string | undefined`.
 *
 * On the server the schema is enforced via Zod at module init time.
 * On the client only NEXT_PUBLIC_* vars are inlined by Next.js at build time,
 * so we return a plain object without running the server-side schema (server
 * secrets are not available in the browser bundle).
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Server-side schema — validated once at startup
// ---------------------------------------------------------------------------

const serverEnvSchema = z.object({
  // Auth (required in production; relaxed in test/CI environments)
  NEXTAUTH_SECRET: z
    .string()
    .min(16, "NEXTAUTH_SECRET must be at least 16 characters")
    .optional()
    .refine(
      (val) => process.env.NODE_ENV !== "production" || (val !== undefined && val.length >= 16),
      { message: "NEXTAUTH_SECRET is required in production" }
    ),
  AUTH_SECRET: z
    .string()
    .min(16, "AUTH_SECRET must be at least 16 characters")
    .optional()
    .refine(
      (val) => process.env.NODE_ENV !== "production" || (val !== undefined && val.length >= 16),
      { message: "AUTH_SECRET is required in production" }
    ),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL").optional(),

  // Public — still accessible server-side
  NEXT_PUBLIC_API_URL: z.string().url("NEXT_PUBLIC_API_URL must be a valid URL"),
  NEXT_PUBLIC_SITE_URL: z.string().url("NEXT_PUBLIC_SITE_URL must be a valid URL").optional(),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional().or(z.literal("")),

  // VAPID — server-only secret
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().email().optional(),
});

// ---------------------------------------------------------------------------
// Client-side subset — only NEXT_PUBLIC_* vars inlined at build time
// ---------------------------------------------------------------------------

const clientEnv = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001/api/v1",
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
} as const;

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

const isServer = typeof window === "undefined";

/**
 * Typed, validated environment variables.
 *
 * @example
 * import { env } from "@/lib/env";
 * fetch(env.NEXT_PUBLIC_API_URL + "/restaurants");
 */
export const env = isServer ? serverEnvSchema.parse(process.env) : clientEnv;
