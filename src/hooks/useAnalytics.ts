"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import type { AnalyticsData } from "@/lib/api/analytics";

interface UseAnalyticsState {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
}

interface UseAnalyticsResult extends UseAnalyticsState {
  refetch: () => Promise<void>;
}

/**
 * Hook that fetches platform analytics data via the server-side proxy.
 *
 * The backend JWT is never exposed to the browser — the `/api/analytics`
 * route handler attaches it server-side from the NextAuth JWT.
 *
 * @example
 * const { data, isLoading, error, refetch } = useAnalytics("30d");
 */
export function useAnalytics(timeRange: string = "30d"): UseAnalyticsResult {
  const { status } = useSession();

  const [state, setState] = useState<UseAnalyticsState>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetchAnalytics = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch(`/api/analytics?timeRange=${encodeURIComponent(timeRange)}`);
      if (!response.ok) {
        throw new Error(`Analytics error: ${response.status}`);
      }
      const json = (await response.json()) as { data?: AnalyticsData } & AnalyticsData;
      const data = json.data ?? json;
      setState({ data, isLoading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load analytics";
      setState({ data: null, isLoading: false, error: message });
    }
  }, [timeRange]);

  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated") {
      setState({ data: null, isLoading: false, error: "Not authenticated" });
      return;
    }
    fetchAnalytics();
  }, [fetchAnalytics, status]);

  return { ...state, refetch: fetchAnalytics };
}
