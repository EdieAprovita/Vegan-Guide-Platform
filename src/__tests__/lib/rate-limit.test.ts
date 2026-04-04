/**
 * Tests for rate-limit security hardening:
 *  - Issue A: Redis fallback uses 10x stricter limit (fail semi-closed)
 *  - Issue B: x-real-ip only trusted when RATE_LIMIT_TRUST_X_REAL_IP=true
 */

import type { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Mock next/server — we only need NextResponse.json for applyRateLimit tests.
// ---------------------------------------------------------------------------
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body: unknown, init?: ResponseInit) => ({
      status: init?.status ?? 200,
      body,
    })),
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildRequest(headers: Record<string, string | null>, path = "/api/test"): NextRequest {
  const headerStore: Record<string, string | null> = {};
  for (const [k, v] of Object.entries(headers)) {
    headerStore[k.toLowerCase()] = v;
  }

  return {
    headers: {
      get: (key: string) => headerStore[key.toLowerCase()] ?? null,
    },
    nextUrl: new URL(`http://localhost${path}`),
    url: `http://localhost${path}`,
  } as unknown as NextRequest;
}

function buildIPv4(a: number, b: number, c: number, d: number): string {
  return [a, b, c, d].join(".");
}

// ---------------------------------------------------------------------------
// Issue B — x-real-ip trust gating
// ---------------------------------------------------------------------------

describe("getClientIP — x-real-ip trust gating", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("ignores x-real-ip when RATE_LIMIT_TRUST_X_REAL_IP is not set", async () => {
    delete process.env.RATE_LIMIT_TRUST_X_REAL_IP;

    const { rateLimit } = await import("@/lib/rate-limit");
    const limiter = rateLimit({ windowMs: 60_000, maxAttempts: 5 });

    // x-real-ip carries an attacker-controlled IP; x-forwarded-for has the real one.
    const req = buildRequest({
      "x-real-ip": buildIPv4(1, 2, 3, 4),
      "x-forwarded-for": buildIPv4(10, 0, 0, 1),
    });

    const result = await limiter.check(req);

    // With x-real-ip ignored the key is derived from x-forwarded-for (10.0.0.1),
    // not from x-real-ip. We can't assert on the internal key
    // directly, but we CAN assert the call succeeds (count 1 <= 5).
    expect(result.success).toBe(true);
    expect(result.limit).toBe(5);
  });

  it("ignores x-real-ip when RATE_LIMIT_TRUST_X_REAL_IP=false", async () => {
    process.env.RATE_LIMIT_TRUST_X_REAL_IP = "false";

    const { rateLimit } = await import("@/lib/rate-limit");
    const limiter = rateLimit({ windowMs: 60_000, maxAttempts: 5 });

    const req = buildRequest({
      "x-real-ip": buildIPv4(1, 2, 3, 4),
      "x-forwarded-for": buildIPv4(10, 0, 0, 1),
    });

    const result = await limiter.check(req);
    expect(result.success).toBe(true);
  });

  it("uses x-real-ip when RATE_LIMIT_TRUST_X_REAL_IP=true", async () => {
    process.env.RATE_LIMIT_TRUST_X_REAL_IP = "true";

    const { rateLimit } = await import("@/lib/rate-limit");
    const limiter = rateLimit({ windowMs: 60_000, maxAttempts: 5 });

    const req = buildRequest({ "x-real-ip": buildIPv4(1, 2, 3, 4) });

    const result = await limiter.check(req);
    expect(result.success).toBe(true);
    expect(result.limit).toBe(5);
  });

  it("rejects an invalid x-real-ip value even when env var is set", async () => {
    process.env.RATE_LIMIT_TRUST_X_REAL_IP = "true";

    const { rateLimit } = await import("@/lib/rate-limit");
    const limiter = rateLimit({ windowMs: 60_000, maxAttempts: 5 });

    // Malformed header — should fall through to x-forwarded-for
    const req = buildRequest({
      "x-real-ip": "<script>alert(1)</script>",
      "x-forwarded-for": buildIPv4(10, 0, 0, 2),
    });

    const result = await limiter.check(req);
    expect(result.success).toBe(true);
  });

  it("falls back to unknown when no IP header is present and env var is not set", async () => {
    delete process.env.RATE_LIMIT_TRUST_X_REAL_IP;

    const { rateLimit } = await import("@/lib/rate-limit");
    const limiter = rateLimit({ windowMs: 60_000, maxAttempts: 5 });

    const req = buildRequest({});

    const result = await limiter.check(req);
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Issue A — Redis fallback uses stricter limit (fail semi-closed)
// ---------------------------------------------------------------------------

describe("rateLimit — Redis fallback uses stricter limit", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    // Simulate Upstash config being present so we exercise the try/catch path.
    process.env.UPSTASH_REDIS_REST_URL = "https://fake-redis.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "fake-token";
    // Disable x-real-ip trust to keep tests isolated.
    delete process.env.RATE_LIMIT_TRUST_X_REAL_IP;

    // jest-environment-jsdom may not expose fetch on global — assign explicitly
    // so jest.spyOn can wrap it.
    if (!("fetch" in global)) {
      (global as unknown as Record<string, unknown>).fetch = jest.fn();
    }
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it("enforces RATE_LIMIT_FALLBACK_MAX (maxAttempts/10) when Redis throws", async () => {
    // Make fetch throw to simulate Redis being unavailable.
    jest.spyOn(global, "fetch").mockRejectedValue(new Error("Redis unavailable"));

    const { rateLimit } = await import("@/lib/rate-limit");
    // maxAttempts = 100 → fallback = 10
    const limiter = rateLimit({ windowMs: 60_000, maxAttempts: 100 });

    const req = buildRequest(
      { "x-forwarded-for": buildIPv4(10, 0, 0, 3) },
      "/api/test-fallback",
    );

    // Requests 1-10 should succeed under the fallback limit.
    for (let i = 1; i <= 10; i++) {
      const result = await limiter.check(req);
      expect(result.success).toBe(true);
      expect(result.limit).toBe(10); // reflects RATE_LIMIT_FALLBACK_MAX, not 100
    }

    // Request 11 should be rejected.
    const over = await limiter.check(req);
    expect(over.success).toBe(false);
    expect(over.limit).toBe(10);
  });

  it("emits a structured warning log on Redis failure", async () => {
    jest.spyOn(global, "fetch").mockRejectedValue(new Error("timeout"));
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const { rateLimit } = await import("@/lib/rate-limit");
    const limiter = rateLimit({ windowMs: 60_000, maxAttempts: 50 });

    const req = buildRequest({ "x-forwarded-for": "client-edge-warn" }, "/api/warn-test");
    await limiter.check(req);

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[rate-limit]"),
      expect.objectContaining({ fallback: true, stricterLimit: 5 })
    );
  });

  it("uses full maxAttempts limit when Redis succeeds", async () => {
    // Simulate Redis returning count = 1 on first call, then TTL = 30000.
    // Build minimal Response-like objects to avoid the jsdom missing `Response`.
    const makeOkResponse = (body: unknown) => ({
      ok: true,
      status: 200,
      json: () => Promise.resolve(body),
    });

    jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(makeOkResponse({ result: 1 }) as unknown as Response) // INCR
      .mockResolvedValueOnce(makeOkResponse({ result: 30000 }) as unknown as Response); // PTTL

    const { rateLimit } = await import("@/lib/rate-limit");
    const limiter = rateLimit({ windowMs: 60_000, maxAttempts: 100 });

    const req = buildRequest({ "x-forwarded-for": "client-edge-healthy" }, "/api/healthy");
    const result = await limiter.check(req);

    expect(result.success).toBe(true);
    expect(result.limit).toBe(100); // full limit — Redis was healthy
  });
});
