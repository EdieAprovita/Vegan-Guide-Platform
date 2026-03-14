// Server-side authentication utilities
import { auth, SESSION_COOKIE_NAME } from "@/lib/auth";

/**
 * Get the authenticated user's backend token for server-side API calls.
 * Reads the token from the NextAuth JWT (server-side only, never exposed to the browser).
 *
 * Callers should invoke auth() before this function so the jwt callback has had
 * a chance to refresh the backend token if it is near expiry.
 */
export async function getServerAuthToken(): Promise<string | null> {
  try {
    const { cookies } = await import("next/headers");
    const { decode } = await import("next-auth/jwt");

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionToken) return null;

    const secret = process.env.AUTH_SECRET;
    if (!secret) return null;

    const decoded = await decode({
      token: sessionToken,
      secret,
      salt: SESSION_COOKIE_NAME,
    });

    const backendToken = decoded?.backendToken as string | undefined;
    if (!backendToken) return null;

    // Guard: don't return a token we already know is expired.
    // The jwt callback in auth.ts refreshes the token proactively, but if the
    // refresh failed the expiry will be in the past — better to return null
    // and let the caller surface a 401 than forward a known-invalid token.
    const expiry = decoded?.backendTokenExpiry as number | undefined;
    if (typeof expiry === "number" && expiry <= Date.now()) {
      return null;
    }

    return backendToken;
  } catch {
    return null;
  }
}

/**
 * Get the authenticated user's session for server-side operations
 */
export async function getServerSession() {
  return await auth();
}

/**
 * Verify if user is authenticated on server-side
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session?.user;
}

/**
 * Verify if user has required role on server-side
 */
export async function hasRole(requiredRole: string): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === requiredRole;
}

/**
 * Get authenticated headers for server-side API calls
 */
export async function getAuthenticatedHeaders(): Promise<Record<string, string>> {
  const token = await getServerAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Middleware helper to check authentication for API routes
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized", message: "Authentication required" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return null; // Continue processing
}

/**
 * Middleware helper to check role-based access for API routes
 */
export async function requireRole(requiredRole: string) {
  const session = await auth();

  if (!session?.user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized", message: "Authentication required" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (session.user.role !== requiredRole) {
    return new Response(
      JSON.stringify({ error: "Forbidden", message: "Insufficient permissions" }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return null; // Continue processing
}
