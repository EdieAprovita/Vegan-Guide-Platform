// Rate limiting utility for API routes
import { NextRequest, NextResponse } from "next/server";

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxAttempts: number; // Maximum attempts per window
  skipSuccessfulRequests?: boolean; // Skip counting successful requests
}

interface AttemptInfo {
  count: number;
  resetTime: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const RATE_LIMIT_KEY_PREFIX = process.env.RATE_LIMIT_KEY_PREFIX ?? "rate-limit";

// Fallback in-memory store for local development and test environments.
const attempts = new Map<string, AttemptInfo>();

// Clean up expired entries every 10 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, info] of attempts.entries()) {
      if (now > info.resetTime) {
        attempts.delete(key);
      }
    }
  },
  10 * 60 * 1000
);

function hasDistributedStoreConfig(): boolean {
  return Boolean(UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN);
}

async function runUpstashCommand<T>(args: Array<string | number>): Promise<T | null> {
  if (!hasDistributedStoreConfig()) return null;

  const response = await fetch(UPSTASH_REDIS_REST_URL!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Upstash command failed with status ${response.status}`);
  }

  const payload = (await response.json()) as { result?: T };
  if (!("result" in payload)) {
    throw new Error("Upstash response did not include a result field");
  }

  return payload.result ?? null;
}

async function incrementDistributedCounter(
  key: string,
  windowMs: number
): Promise<{ count: number; resetTime: number } | null> {
  if (!hasDistributedStoreConfig()) return null;

  const count = await runUpstashCommand<number>(["INCR", key]);
  if (typeof count !== "number") return null;

  let ttlMs = await runUpstashCommand<number>(["PTTL", key]);
  if (typeof ttlMs !== "number") return null;

  if (ttlMs < 0) {
    await runUpstashCommand<number>(["PEXPIRE", key, windowMs]);
    ttlMs = windowMs;
  }

  return {
    count,
    resetTime: Date.now() + Math.max(ttlMs, 1),
  };
}

function incrementInMemoryCounter(
  key: string,
  windowMs: number
): { count: number; resetTime: number } {
  const now = Date.now();
  let attemptInfo = attempts.get(key);

  if (!attemptInfo || now > attemptInfo.resetTime) {
    attemptInfo = {
      count: 0,
      resetTime: now + windowMs,
    };
  }

  attemptInfo.count++;
  attempts.set(key, attemptInfo);

  return {
    count: attemptInfo.count,
    resetTime: attemptInfo.resetTime,
  };
}

function toRateLimitResult(count: number, maxAttempts: number, resetTime: number): RateLimitResult {
  return {
    success: count <= maxAttempts,
    limit: maxAttempts,
    remaining: Math.max(0, maxAttempts - count),
    reset: new Date(resetTime),
  };
}

export function rateLimit(options: RateLimitOptions) {
  // 10x stricter limit used when the distributed store is unavailable so the
  // fallback fails semi-closed rather than fully open in multi-instance
  // / serverless deployments where each instance has its own in-memory store.
  const RATE_LIMIT_FALLBACK_MAX = Math.floor(options.maxAttempts / 10);

  return {
    check: async (request: NextRequest, identifier?: string): Promise<RateLimitResult> => {
      const ip = identifier || getClientIP(request);
      const key = `${RATE_LIMIT_KEY_PREFIX}:${ip}:${request.nextUrl.pathname}`;

      try {
        const distributed = await incrementDistributedCounter(key, options.windowMs);
        if (distributed) {
          return toRateLimitResult(distributed.count, options.maxAttempts, distributed.resetTime);
        }
      } catch (error) {
        // Distributed store failures should not break auth/profile routes, but
        // we apply a much stricter in-memory limit to avoid fail-open behavior.
        console.warn("[rate-limit] Falling back to in-memory store:", {
          fallback: true,
          stricterLimit: RATE_LIMIT_FALLBACK_MAX,
          error: error instanceof Error ? error.message : String(error),
        });

        const local = incrementInMemoryCounter(key, options.windowMs);
        return toRateLimitResult(local.count, RATE_LIMIT_FALLBACK_MAX, local.resetTime);
      }

      const local = incrementInMemoryCounter(key, options.windowMs);
      return toRateLimitResult(local.count, options.maxAttempts, local.resetTime);
    },
  };
}

// Rate limit configurations for different endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxAttempts: 5, // 5 attempts per 15 minutes
});

export const generalApiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxAttempts: 100, // 100 requests per minute
});

export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxAttempts: 3, // 3 attempts per hour
});

// Returns true for valid IPv4 or IPv6 addresses (basic structural check).
function isValidIP(ip: string): boolean {
  return /^[\d.]+$|^[a-f0-9:]+$/i.test(ip.trim());
}

// Utility to get client IP
function getClientIP(request: NextRequest): string {
  // Only trust x-real-ip when explicitly enabled via env var. Without this
  // guard an attacker can forge the header and bypass per-IP rate limits.
  if (process.env.RATE_LIMIT_TRUST_X_REAL_IP === "true") {
    const xRealIp = request.headers.get("x-real-ip");
    if (xRealIp && isValidIP(xRealIp)) {
      return xRealIp.trim();
    }
  }

  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const ips = xff
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    if (ips.length > 0) {
      const trustedProxyHopsRaw = Number.parseInt(
        process.env.RATE_LIMIT_TRUSTED_PROXY_HOPS ?? "0",
        10
      );
      const trustedProxyHops =
        Number.isFinite(trustedProxyHopsRaw) && trustedProxyHopsRaw >= 0 ? trustedProxyHopsRaw : 0;
      const index = Math.max(0, ips.length - 1 - trustedProxyHops);
      return ips[index];
    }
  }

  return "unknown";
}

// Middleware helper to apply rate limiting
export async function applyRateLimit(
  request: NextRequest,
  limiter: ReturnType<typeof rateLimit>,
  identifier?: string
): Promise<NextResponse | null> {
  const result = await limiter.check(request, identifier);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil((result.reset.getTime() - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": result.limit.toString(),
          "X-RateLimit-Remaining": result.remaining.toString(),
          "X-RateLimit-Reset": result.reset.toISOString(),
          "Retry-After": Math.ceil((result.reset.getTime() - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  return null; // No rate limit hit, continue processing
}
