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

// In-memory store (in production, use Redis or similar)
const attempts = new Map<string, AttemptInfo>();

// Clean up expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, info] of attempts.entries()) {
    if (now > info.resetTime) {
      attempts.delete(key);
    }
  }
}, 10 * 60 * 1000);

export function rateLimit(options: RateLimitOptions) {
  return {
    check: async (request: NextRequest, identifier?: string): Promise<{ success: boolean; limit: number; remaining: number; reset: Date }> => {
      const now = Date.now();
      const ip = identifier || getClientIP(request);
      const key = `${ip}:${request.nextUrl.pathname}`;
      
      let attemptInfo = attempts.get(key);
      
      // Initialize or reset if window expired
      if (!attemptInfo || now > attemptInfo.resetTime) {
        attemptInfo = {
          count: 0,
          resetTime: now + options.windowMs,
        };
      }
      
      attemptInfo.count++;
      attempts.set(key, attemptInfo);
      
      const success = attemptInfo.count <= options.maxAttempts;
      const remaining = Math.max(0, options.maxAttempts - attemptInfo.count);
      const reset = new Date(attemptInfo.resetTime);
      
      return {
        success,
        limit: options.maxAttempts,
        remaining,
        reset,
      };
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

// Utility to get client IP
function getClientIP(request: NextRequest): string {
  const xff = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  
  if (xff) {
    return xff.split(",")[0].trim();
  }
  
  if (realIp) {
    return realIp.trim();
  }
  
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
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