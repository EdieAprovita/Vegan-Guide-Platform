"use client";

import { useState, useEffect, useCallback } from "react";
import { getAnalytics, type AnalyticsData } from "@/lib/api/analytics";
import { useApiToken } from "@/hooks/useApiToken";

interface UseAnalyticsState {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
}

interface UseAnalyticsResult extends UseAnalyticsState {
  refetch: () => Promise<void>;
}

/**
 * Hook that fetches platform analytics data.
 *
 * - Reads the backend JWT from the NextAuth session via `useApiToken`.
 * - Supports an optional `timeRange` parameter (e.g. "7d", "30d", "90d", "1y").
 * - Falls back to aggregated endpoint data when the dedicated analytics
 *   endpoint is unavailable (see `getAnalytics` in `src/lib/api/analytics.ts`).
 *
 * @example
 * const { data, isLoading, error, refetch } = useAnalytics("30d");
 */
export function useAnalytics(timeRange: string = "30d"): UseAnalyticsResult {
  const { token, isLoading: isTokenLoading } = useApiToken();

  const [state, setState] = useState<UseAnalyticsState>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetchAnalytics = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await getAnalytics(timeRange, token ?? undefined);
      setState({ data, isLoading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load analytics";
      setState({ data: null, isLoading: false, error: message });
    }
  }, [timeRange, token]);

  // Wait until the session token has been resolved before fetching
  useEffect(() => {
    if (isTokenLoading) return;
    fetchAnalytics();
  }, [fetchAnalytics, isTokenLoading]);

  return { ...state, refetch: fetchAnalytics };
}
