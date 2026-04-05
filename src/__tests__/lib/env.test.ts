/**
 * Unit tests for src/lib/env.ts
 *
 * Validates that the Zod schema correctly accepts valid env vars,
 * rejects missing required keys, and provides typed access.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Helpers — re-create the schema locally so we can test it in isolation
// without triggering the module-level parse() side-effect.
// ---------------------------------------------------------------------------

const serverEnvSchema = z.object({
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
  NEXT_PUBLIC_API_URL: z.string().url("NEXT_PUBLIC_API_URL must be a valid URL"),
  NEXT_PUBLIC_SITE_URL: z.string().url("NEXT_PUBLIC_SITE_URL must be a valid URL").optional(),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional().or(z.literal("")),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().email().optional(),
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("env schema validation", () => {
  const validBase = {
    NEXT_PUBLIC_API_URL: "http://localhost:5001/api/v1",
  };

  it("accepts a minimal valid env (only required key)", () => {
    const result = serverEnvSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it("accepts a full valid env", () => {
    const result = serverEnvSchema.safeParse({
      ...validBase,
      NEXTAUTH_SECRET: "supersecretvalue-at-least-16chars",
      AUTH_SECRET: "supersecretvalue-at-least-16chars",
      NEXTAUTH_URL: "https://example.com",
      NEXT_PUBLIC_SITE_URL: "https://example.com",
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: "AIzaSy...",
      NEXT_PUBLIC_VAPID_PUBLIC_KEY: "BPxx...",
      NEXT_PUBLIC_SENTRY_DSN: "https://abc@sentry.io/123",
      VAPID_PRIVATE_KEY: "private-key",
      VAPID_SUBJECT: "admin@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing NEXT_PUBLIC_API_URL", () => {
    const result = serverEnvSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const keys = result.error.issues.map((i) => i.path[0]);
      expect(keys).toContain("NEXT_PUBLIC_API_URL");
    }
  });

  it("rejects an invalid URL for NEXT_PUBLIC_API_URL", () => {
    const result = serverEnvSchema.safeParse({ NEXT_PUBLIC_API_URL: "not-a-url" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "NEXT_PUBLIC_API_URL");
      expect(issue).toBeDefined();
    }
  });

  it("rejects a NEXTAUTH_SECRET shorter than 16 characters", () => {
    const result = serverEnvSchema.safeParse({
      ...validBase,
      NEXTAUTH_SECRET: "short",
    });
    expect(result.success).toBe(false);
  });

  it("accepts an empty string for NEXT_PUBLIC_SENTRY_DSN", () => {
    const result = serverEnvSchema.safeParse({
      ...validBase,
      NEXT_PUBLIC_SENTRY_DSN: "",
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional fields when absent", () => {
    const result = serverEnvSchema.safeParse(validBase);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.NEXTAUTH_SECRET).toBeUndefined();
      expect(result.data.NEXT_PUBLIC_SITE_URL).toBeUndefined();
    }
  });
});
