/**
 * Validated environment variables.
 *
 * Import `env` instead of accessing `process.env` directly so that:
 *  - Missing / malformed variables cause a clear startup error (fail-fast).
 *  - All consumers get a fully-typed object instead of `string | undefined`.
 *
 * SERVER-SIDE: Zod validates the full schema once at module-init time via
 * `env.server.ts`. Secrets (AUTH_SECRET, VAPID_PRIVATE_KEY, …) are only
 * accessible on the server.
 *
 * CLIENT-SIDE: Only NEXT_PUBLIC_* vars are available — they are inlined by
 * Next.js at build time. Zod is NOT included in the browser bundle (zero
 * bundle-size impact). See `env.client.ts`.
 *
 * @example
 * import { env } from "@/lib/env";
 * fetch(env.NEXT_PUBLIC_API_URL + "/restaurants");
 */

import { clientEnv } from "./env.client";
import { parseServerEnv, serverEnvSchema } from "./env.server";

// Re-export schema + parser so tests and other server-only consumers can use
// the real implementation without duplicating it (F-C5).
export { serverEnvSchema, parseServerEnv };
export type { ServerEnv } from "./env.server";
export type { ClientEnv } from "./env.client";

// ---------------------------------------------------------------------------
// Unified `env` export — server gets the full validated object, client gets
// only the NEXT_PUBLIC_* subset (Zod-free).
// ---------------------------------------------------------------------------

const isServer = typeof globalThis.window === "undefined";

export const env = isServer ? parseServerEnv(process.env) : clientEnv;
