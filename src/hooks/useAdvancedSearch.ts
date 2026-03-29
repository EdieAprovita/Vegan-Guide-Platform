"use client";

import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "use-debounce";
import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  SearchFilters,
  SearchResponse,
  ResourceType,
  SortOption,
  Coordinates,
} from "@/types/search";
import {
  searchUnified,
  searchByResourceType,
  getSearchSuggestions,
  getSearchAggregations,
  saveSearchQuery,
} from "@/lib/api/search";
import { useSession } from "next-auth/react";
import { getCurrentLocation } from "@/lib/utils/geospatial";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_FILTERS: SearchFilters = {
  query: "",
  resourceTypes: [],
  location: "",
  radius: 10,
  minRating: 0,
  sortBy: "relevance",
};

const PAGE_SIZE = 12;

// ---------------------------------------------------------------------------
// Query key factory — keeps keys consistent and refactorable
// ---------------------------------------------------------------------------

export const searchKeys = {
  all: ["search"] as const,
  results: (filters: SearchFilters) => ["search", "results", filters] as const,
  suggestions: (query: string) => ["search", "suggestions", query] as const,
  aggregations: (
    filters: Pick<SearchFilters, "resourceTypes" | "location" | "radius" | "coordinates">
  ) => ["search", "aggregations", filters] as const,
} as const;

// ---------------------------------------------------------------------------
// useAdvancedSearch
// ---------------------------------------------------------------------------

export function useAdvancedSearch() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const queryClient = useQueryClient();

  // ------------------------------------------------------------------
  // UI state — filter values and input-level concerns stay as useState
  // ------------------------------------------------------------------

  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Debounced query drives the suggestions fetch (300 ms matches original)
  const [debouncedQuery] = useDebounce(filters.query, 300);

  // ------------------------------------------------------------------
  // Server state — search results (infinite / paginated)
  // ------------------------------------------------------------------

  const searchQuery = useInfiniteQuery({
    queryKey: searchKeys.results(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const page = pageParam as number;

      const response =
        filters.resourceTypes.length === 1
          ? await searchByResourceType(filters.resourceTypes[0], {
              page,
              limit: PAGE_SIZE,
              filters,
            })
          : await searchUnified({ page, limit: PAGE_SIZE, filters });

      return response.data as SearchResponse;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
    enabled: false, // search is user-triggered, not automatic
    placeholderData: keepPreviousData,
    staleTime: 0, // search results should always be fresh on re-fetch
  });

  // Flatten pages into a single results array (mirrors the old append logic)
  const results = searchQuery.data?.pages.flatMap((p) => p.results) ?? [];
  const lastPage = searchQuery.data?.pages.at(-1);
  const total = lastPage?.total ?? 0;
  const currentPage = lastPage?.page ?? 1;
  const totalPages = lastPage?.totalPages ?? 0;

  // ------------------------------------------------------------------
  // Server state — suggestions
  // ------------------------------------------------------------------

  const suggestionsQuery = useQuery({
    queryKey: searchKeys.suggestions(debouncedQuery),
    queryFn: async () => {
      const response = await getSearchSuggestions(debouncedQuery);
      return response.data ?? [];
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 60 * 1000, // suggestions are cheap to cache for 1 minute
    placeholderData: keepPreviousData,
    // When the query is too short, TanStack Query returns stale cached data
    // from a previous longer query. Force empty array in that case so the UI
    // never shows suggestions for an input that no longer warrants them.
    select: (data) => (debouncedQuery.length < 2 ? [] : data),
  });

  // ------------------------------------------------------------------
  // Server state — aggregations (depends on location/type filters only)
  // ------------------------------------------------------------------

  const aggregationFilters = {
    resourceTypes: filters.resourceTypes,
    location: filters.location,
    radius: filters.radius,
    coordinates: filters.coordinates,
  };

  const aggregationsQuery = useQuery({
    queryKey: searchKeys.aggregations(aggregationFilters),
    queryFn: async () => {
      const response = await getSearchAggregations(filters);
      return response.data ?? null;
    },
    staleTime: 2 * 60 * 1000, // aggregation counts change less frequently
    placeholderData: keepPreviousData,
  });

  // ------------------------------------------------------------------
  // Mutation — analytics (fire-and-forget, no cache invalidation needed)
  // ------------------------------------------------------------------

  const saveAnalyticsMutation = useMutation({
    mutationFn: ({ query, resourceType }: { query: string; resourceType?: ResourceType }) =>
      saveSearchQuery(query, resourceType),
    onError: () => {
      // Analytics failure must never surface to the user
    },
  });

  // ------------------------------------------------------------------
  // Actions
  // ------------------------------------------------------------------

  const search = useCallback(async () => {
    // resetQueries clears the cache and re-fetches only page 1, ensuring new
    // searches always start from the beginning. refetch() on an infinite query
    // would re-fetch all currently-cached pages instead.
    await queryClient.resetQueries({ queryKey: searchKeys.results(filters) });

    // Save analytics after the reset triggers a fresh fetch
    if (filters.query && isAuthenticated) {
      const resourceType =
        filters.resourceTypes.length === 1 ? filters.resourceTypes[0] : undefined;
      saveAnalyticsMutation.mutate({ query: filters.query, resourceType });
    }
  }, [queryClient, filters, isAuthenticated, saveAnalyticsMutation]);

  const loadMore = useCallback(() => {
    if (searchQuery.hasNextPage && !searchQuery.isFetchingNextPage) {
      searchQuery.fetchNextPage();
    }
  }, [searchQuery]);

  const updateFilters = useCallback((updates: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setLocationError(null);
  }, []);

  const getUserLocation = useCallback(async () => {
    setLocationError(null);
    try {
      const coordinates = await getCurrentLocation();
      const searchCoords: Coordinates = {
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      };
      updateFilters({ coordinates: searchCoords });
      return searchCoords;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error obteniendo ubicación";
      setLocationError(message);
      throw error;
    }
  }, [updateFilters]);

  // Specific filter setters (unchanged public API)

  const setQuery = useCallback((query: string) => updateFilters({ query }), [updateFilters]);

  const setSortBy = useCallback((sortBy: SortOption) => updateFilters({ sortBy }), [updateFilters]);

  const setResourceTypes = useCallback(
    (resourceTypes: ResourceType[]) => updateFilters({ resourceTypes }),
    [updateFilters]
  );

  const setLocation = useCallback(
    (location: string, coordinates?: Coordinates) => updateFilters({ location, coordinates }),
    [updateFilters]
  );

  const setRadius = useCallback((radius: number) => updateFilters({ radius }), [updateFilters]);

  const setMinRating = useCallback(
    (minRating: number) => updateFilters({ minRating }),
    [updateFilters]
  );

  const setBudgetRange = useCallback(
    (min?: number, max?: number) => updateFilters({ budget: { min, max } }),
    [updateFilters]
  );

  // ------------------------------------------------------------------
  // Derived utilities
  // ------------------------------------------------------------------

  const hasActiveFilters = useCallback((): boolean => {
    const { query, resourceTypes, location, minRating, budget } = filters;
    return !!(
      query ||
      resourceTypes.length > 0 ||
      location ||
      minRating > 0 ||
      budget?.min ||
      budget?.max
    );
  }, [filters]);

  const getActiveFiltersCount = useCallback((): number => {
    let count = 0;
    const { query, resourceTypes, location, minRating, budget } = filters;
    if (query) count++;
    if (resourceTypes.length > 0) count++;
    if (location) count++;
    if (minRating > 0) count++;
    if (budget?.min || budget?.max) count++;
    return count;
  }, [filters]);

  // ------------------------------------------------------------------
  // Compose the original SearchState shape so consumer components don't
  // need to change any of their references.
  // ------------------------------------------------------------------

  const isSearching = searchQuery.isFetching || searchQuery.isFetchingNextPage;
  const searchError =
    searchQuery.error instanceof Error ? searchQuery.error.message : locationError;

  const searchState = {
    isSearching,
    filters,
    results,
    total,
    currentPage,
    totalPages,
    error: searchError,
  };

  return {
    // State
    searchState,
    suggestions: suggestionsQuery.data ?? [],
    aggregations: aggregationsQuery.data ?? null,

    // Actions
    search,
    loadMore,
    updateFilters,
    clearFilters,
    getUserLocation,

    // Specific filter setters
    setQuery,
    setSortBy,
    setResourceTypes,
    setLocation,
    setRadius,
    setMinRating,
    setBudgetRange,

    // Utilities
    hasActiveFilters,
    getActiveFiltersCount,

    // Computed state
    canLoadMore: searchQuery.hasNextPage ?? false,
    hasResults: results.length > 0,
    isEmpty: !isSearching && results.length === 0 && hasActiveFilters(),
  };
}

// ---------------------------------------------------------------------------
// useGeolocation — no server state; no changes needed beyond keeping the
// existing implementation intact.
// ---------------------------------------------------------------------------

export function useGeolocation() {
  const [state, setState] = useState<{
    coordinates: Coordinates | null;
    accuracy: number | null;
    isLoading: boolean;
    error: string | null;
    permission: PermissionState | null;
  }>({
    coordinates: null,
    accuracy: null,
    isLoading: false,
    error: null,
    permission: null,
  });

  const getCurrentPosition = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const coordinates = await getCurrentLocation();
      const searchCoords: Coordinates = {
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      };
      setState((prev) => ({
        ...prev,
        coordinates: searchCoords,
        isLoading: false,
      }));
      return searchCoords;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error obteniendo ubicación";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  const clearLocation = useCallback(() => {
    setState({
      coordinates: null,
      accuracy: null,
      isLoading: false,
      error: null,
      permission: null,
    });
  }, []);

  // Check permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((permission) => {
          setState((prev) => ({ ...prev, permission: permission.state }));
        })
        .catch((error) => {
          console.warn("Error checking geolocation permission:", error);
        });
    }
  }, []);

  return {
    ...state,
    getCurrentPosition,
    clearLocation,
    isSupported: typeof window !== "undefined" && "geolocation" in navigator,
  };
}
