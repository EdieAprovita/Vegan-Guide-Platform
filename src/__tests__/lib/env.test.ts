/**
 * Unit tests for src/lib/env.ts
 *
 * Uses the real `serverEnvSchema` and `parseServerEnv` exported from the
 * module (F-C5) so tests always stay in sync with the production
 * implementation.
 */

import { parseServerEnv, serverEnvSchema } from "@/lib/env";

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
      AUTH_SECRET: "supersecretvalue-at-least-16chars",
      NEXTAUTH_SECRET: "supersecretvalue-at-least-16chars",
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

  // -------------------------------------------------------------------------
  // F-C1 — AUTH_SECRET required in production (F-C6)
  // -------------------------------------------------------------------------

  describe("NODE_ENV=production validation", () => {
    const originalNodeEnv = process.env.NODE_ENV;

    afterEach(() => {
      // Restore NODE_ENV after each production test
      Object.defineProperty(process.env, "NODE_ENV", {
        value: originalNodeEnv,
        writable: true,
        configurable: true,
      });
    });

    function setProductionEnv() {
      Object.defineProperty(process.env, "NODE_ENV", {
        value: "production",
        writable: true,
        configurable: true,
      });
    }

    it("fails when AUTH_SECRET is missing in production", () => {
      setProductionEnv();
      const result = serverEnvSchema.safeParse(validBase);
      expect(result.success).toBe(false);
      if (!result.success) {
        const keys = result.error.issues.map((i) => i.path[0]);
        expect(keys).toContain("AUTH_SECRET");
      }
    });

    it("passes when AUTH_SECRET is set in production", () => {
      setProductionEnv();
      const result = serverEnvSchema.safeParse({
        ...validBase,
        AUTH_SECRET: "a-secure-production-secret-32chars",
      });
      expect(result.success).toBe(true);
    });

    it("fails when NEXTAUTH_SECRET does not match AUTH_SECRET in production", () => {
      setProductionEnv();
      const result = serverEnvSchema.safeParse({
        ...validBase,
        AUTH_SECRET: "a-secure-production-secret-32chars",
        NEXTAUTH_SECRET: "different-secret-value-16charsXX",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const keys = result.error.issues.map((i) => i.path[0]);
        expect(keys).toContain("NEXTAUTH_SECRET");
      }
    });

    it("passes when NEXTAUTH_SECRET matches AUTH_SECRET in production", () => {
      setProductionEnv();
      const secret = "a-secure-production-secret-32chars";
      const result = serverEnvSchema.safeParse({
        ...validBase,
        AUTH_SECRET: secret,
        NEXTAUTH_SECRET: secret,
      });
      expect(result.success).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // F-C5 — parseServerEnv helper uses the real schema
  // -------------------------------------------------------------------------

  it("parseServerEnv returns typed env when input is valid", () => {
    const parsed = parseServerEnv({
      ...validBase,
      AUTH_SECRET: "supersecretvalue-at-least-16chars",
    });
    expect(parsed.NEXT_PUBLIC_API_URL).toBe("http://localhost:5001/api/v1");
    expect(parsed.AUTH_SECRET).toBe("supersecretvalue-at-least-16chars");
  });

  it("parseServerEnv throws ZodError when input is invalid", () => {
    expect(() => parseServerEnv({})).toThrow();
  });
});
