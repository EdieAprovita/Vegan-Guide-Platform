import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let session;
  try {
    session = await auth();
  } catch (error) {
    // Auth provider failed — log for observability, redirect without callbackUrl to avoid loops
    console.error("[middleware] auth() failed:", error);
    return NextResponse.redirect(new URL("/login", request.url));
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

    // Validate callbackUrl: must be a safe relative path
    const callbackPath = pathname.split("?")[0]; // strip query params
    const isSafeCallback =
      callbackPath.startsWith("/") &&
      !callbackPath.startsWith("//") &&
      !callbackPath.includes("\\");

    if (isSafeCallback) {
      url.searchParams.set("callbackUrl", callbackPath);
    }

    return NextResponse.redirect(url);
  }

  // If user is authenticated and trying to access auth pages
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  // Role-based protection: only admins can access /admin routes
  if (pathname.startsWith("/admin")) {
    const userRole = (session?.user as { role?: string } | undefined)?.role;
    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
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
