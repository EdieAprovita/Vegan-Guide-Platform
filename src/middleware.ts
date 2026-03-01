import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/forgot-password");

  // If user is not authenticated and trying to access protected routes
  if (!session && !isAuthPage) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
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
