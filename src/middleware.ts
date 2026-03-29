import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Generate a cryptographically random nonce for CSP.
 * Uses crypto.randomUUID() which is available in Edge Runtime (middleware).
 * The nonce is base64-safe (no special chars) after stripping hyphens.
 */
function generateNonce(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

function buildCsp(nonce: string): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  let apiOrigin = apiUrl;
  try {
    const parsed = new URL(apiUrl);
    apiOrigin = parsed.origin;
  } catch {
    // If URL parsing fails, use the raw value as fallback
  }
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://images.pexels.com https://images.unsplash.com https://via.placeholder.com",
    "font-src 'self'",
    `connect-src 'self' ${apiOrigin}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];
  return directives.join("; ");
}

function applySecurityHeaders(response: NextResponse, nonce: string): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
  response.headers.set("Content-Security-Policy", buildCsp(nonce));
  response.headers.delete("X-Powered-By");
  return response;
}

export async function middleware(request: NextRequest) {
  // Generate a fresh nonce for every request — used in CSP script-src
  const nonce = generateNonce();

  let session;
  try {
    session = await auth();
  } catch (error) {
    // Auth provider failed — log for observability, redirect without callbackUrl to avoid loops
    console.error("[middleware] auth() failed:", error);
    return applySecurityHeaders(NextResponse.redirect(new URL("/login", request.url)), nonce);
  }

  const { pathname } = request.nextUrl;

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/forgot-password");

  // If user is not authenticated and trying to access protected routes
  if (!session && !isAuthPage) {
    const url = new URL("/login", request.url);

    // Validate callbackUrl: must be a safe, same-origin relative path
    const rawCallbackPath = pathname.split("?")[0]; // strip query params
    let safeCallbackPath: string | null = null;
    try {
      const decodedPath = decodeURIComponent(rawCallbackPath);
      const isSafe =
        decodedPath.startsWith("/") && !decodedPath.startsWith("//") && !decodedPath.includes("\\");

      if (isSafe) {
        const baseUrl = new URL(request.url);
        const resolved = new URL(decodedPath, baseUrl);
        if (resolved.origin === baseUrl.origin) {
          safeCallbackPath = decodedPath;
        }
      }
    } catch {
      // Malformed percent-encoding — treat as unsafe
    }

    if (safeCallbackPath) {
      url.searchParams.set("callbackUrl", safeCallbackPath);
    }

    return applySecurityHeaders(NextResponse.redirect(url), nonce);
  }

  // If user is authenticated and trying to access auth pages
  if (session && isAuthPage) {
    return applySecurityHeaders(NextResponse.redirect(new URL("/profile", request.url)), nonce);
  }

  // Role-based protection: only admins can access /admin routes
  if (pathname.startsWith("/admin")) {
    const userRole = (session?.user as { role?: string } | undefined)?.role;
    if (userRole !== "admin") {
      return applySecurityHeaders(NextResponse.redirect(new URL("/", request.url)), nonce);
    }
  }

  // Forward the nonce to server components via a request header.
  // Next.js propagates request headers set in middleware to headers() in RSC.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  return applySecurityHeaders(response, nonce);
}

export const config = {
  matcher: [
    // Auth pages — needed to redirect authenticated users away
    "/login",
    "/register",
    "/reset-password",
    "/forgot-password",
    // Protected user routes
    "/profile/:path*",
    "/settings/:path*",
    "/notifications",
    "/achievements",
    "/reviews",
    "/recommendations",
    // Protected content-creation routes
    "/recipes/new",
    "/businesses/new",
    // Protected admin and analytics routes
    "/admin/:path*",
    "/analytics",
  ],
};
