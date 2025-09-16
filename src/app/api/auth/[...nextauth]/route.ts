import { handlers } from "@/lib/auth";
import { NextRequest } from "next/server";
import { authRateLimit, applyRateLimit } from "@/lib/rate-limit";

// Apply rate limiting to authentication routes
async function withRateLimit(
  handler: (req: NextRequest) => Promise<Response>,
  req: NextRequest
): Promise<Response> {
  // Apply rate limiting only to POST requests (login attempts)
  if (req.method === "POST") {
    const rateLimitResult = await applyRateLimit(req, authRateLimit);
    if (rateLimitResult) {
      return rateLimitResult;
    }
  }

  return handler(req);
}

export async function GET(req: NextRequest) {
  return withRateLimit(handlers.GET, req);
}

export async function POST(req: NextRequest) {
  return withRateLimit(handlers.POST, req);
}
