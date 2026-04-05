/**
 * Server-side environment validation (Zod).
 *
 * This module is imported only on the server. It runs Zod validation once at
 * module-init time (fail-fast) and exports the fully-typed parsed result.
 *
 * NEVER import this module from client components — it would pull Zod into the
 * browser bundle. Use `@/lib/env.client` or the re-export in `@/lib/env` from
 * client code instead.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const serverEnvSchema = z
  .object({
    // Auth — AUTH_SECRET is the primary key; NEXTAUTH_SECRET is a legacy alias
    AUTH_SECRET: z.string().min(16, "AUTH_SECRET must be at least 16 characters").optional(),
    NEXTAUTH_SECRET: z
      .string()
      .min(16, "NEXTAUTH_SECRET must be at least 16 characters")
      .optional(),
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
  })
  .superRefine((data, ctx) => {
    const isProd = process.env.NODE_ENV === "production";

    // F-C1: AUTH_SECRET required in production
    if (isProd && (!data.AUTH_SECRET || data.AUTH_SECRET.length < 16)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["AUTH_SECRET"],
        message: "AUTH_SECRET is required in production (min 16 chars)",
      });
    }

    // F-C1: If both are present they must match
    if (data.AUTH_SECRET && data.NEXTAUTH_SECRET && data.AUTH_SECRET !== data.NEXTAUTH_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["NEXTAUTH_SECRET"],
        message: "NEXTAUTH_SECRET must match AUTH_SECRET when both are set",
      });
    }
  });

// ---------------------------------------------------------------------------
// Parser — exported so tests use the real implementation (F-C5)
// ---------------------------------------------------------------------------

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(processEnv: Record<string, string | undefined>): ServerEnv {
  return serverEnvSchema.parse(processEnv);
}
