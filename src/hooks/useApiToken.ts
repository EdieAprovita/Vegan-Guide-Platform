"use client";

import { useSession } from "next-auth/react";

/**
 * @deprecated The backend token is no longer exposed in the client session.
 * Use server-side API route handlers (e.g. `/api/analytics`) to proxy
 * authenticated requests instead. The token stays in the NextAuth JWT
 * and is attached server-side, preventing XSS exposure.
 *
 * This hook now only provides authentication status — `token` is always null.
 */
export function useApiToken() {
  const { status } = useSession();

  return {
    token: null,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  };
}
