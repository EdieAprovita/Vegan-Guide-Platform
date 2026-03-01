"use client";

import { useSession } from "next-auth/react";

/**
 * Hook that encapsulates token extraction from the NextAuth session.
 * The token is stored at session.user.token via the `session` callback in
 * src/lib/auth.ts (mapped from the JWT's `backendToken` field).
 *
 * Use this instead of manually casting session.user in every component:
 *
 * @example
 * const { token, isAuthenticated, isLoading } = useApiToken();
 * if (isAuthenticated) {
 *   await createReview({ token, ... });
 * }
 */
export function useApiToken() {
  const { data: session, status } = useSession();

  // session.user.token is typed as `string | undefined` in the NextAuth
  // module augmentation defined in src/lib/auth.ts.
  const token = (session?.user as { token?: string } | undefined)?.token ?? null;
  const isAuthenticated = status === "authenticated" && !!token;
  const isLoading = status === "loading";

  return { token, isAuthenticated, isLoading };
}
