import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url("NEXT_PUBLIC_API_URL must be a valid URL"),
  NEXT_PUBLIC_GOOGLE_MAPS_KEY: z.string().optional(),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required").optional(),
  NEXTAUTH_URL: z.string().url().optional(),
});

/**
 * Validated environment variables.
 *
 * On the server: parsed and validated via Zod at request time.
 * On the client: NEXT_PUBLIC_* vars are inlined at build time by Next.js,
 *   so we return a plain object without running Zod (which would fail because
 *   server-only vars like NEXTAUTH_SECRET are not available in the browser).
 */
const isServer = typeof window === "undefined";

export const env = isServer
  ? envSchema.parse(process.env)
  : {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001",
      NEXT_PUBLIC_GOOGLE_MAPS_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
      NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    };
