"use client";

import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "use-debounce";
import {
  SearchFilters,
  SearchResponse,
  SearchState,
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
import { useAuthStore } from "@/lib/store/auth";
import { getCurrentLocation } from "@/lib/utils/geospatial";

const DEFAULT_FILTERS: SearchFilters = {
  query: "",
  resourceTypes: [],
  location: "",
  radius: 10,
  minRating: 0,
  sortBy: "relevance",
};

export function useAdvancedSearch() {
  const { token } = useAuthStore();

  const [searchState, setSearchState] = useState<SearchState>({
    isSearching: false,
    filters: DEFAULT_FILTERS,
    results: [],
    total: 0,
    currentPage: 1,
    totalPages: 0,
    error: null,
  });

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [aggregations, setAggregations] = useState<{
    resourceTypes: Record<ResourceType, number>;
    locations: Array<{ name: string; count: number }>;
    priceRanges: Array<{ range: string; count: number }>;
    ratings: Record<number, number>;
  } | null>(null);

  // Debounced query for suggestions
  const [debouncedQuery] = useDebounce(searchState.filters.query, 300);

  // Load suggestions when query changes
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 2) {
      loadSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  // Load aggregations when filters change (excluding query)
  useEffect(() => {
    loadAggregations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchState.filters.resourceTypes,
    searchState.filters.location,
    searchState.filters.radius,
    searchState.filters.coordinates,
  ]);

  const loadSuggestions = async (query: string) => {
    try {
      const response = await getSearchSuggestions(query);
      setSuggestions(response.data || []);
    } catch (error) {
      console.error("Error loading suggestions:", error);
      setSuggestions([]);
    }
  };

  const loadAggregations = async () => {
    try {
      const response = await getSearchAggregations(searchState.filters);
      setAggregations(response.data || null);
    } catch (error) {
      console.error("Error loading aggregations:", error);
      setAggregations(null);
    }
  };

  const updateFilters = useCallback((updates: Partial<SearchFilters>) => {
    setSearchState((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...updates },
      currentPage: 1, // Reset to first page when filters change
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearchState((prev) => ({
      ...prev,
      filters: DEFAULT_FILTERS,
      results: [],
      total: 0,
      currentPage: 1,
      totalPages: 0,
      error: null,
    }));
    setSuggestions([]);
  }, []);

  const search = useCallback(
    async (page = 1) => {
      setSearchState((prev) => ({ ...prev, isSearching: true, error: null }));

      try {
        let response: { data: SearchResponse };

        if (searchState.filters.resourceTypes.length === 1) {
          // Search within single resource type
          response = await searchByResourceType(searchState.filters.resourceTypes[0], {
            page,
            limit: 12,
            filters: searchState.filters,
          });
        } else {
          // Unified search across all types
          response = await searchUnified({
            page,
            limit: 12,
            filters: searchState.filters,
          });
        }

        const searchData = response.data;

        setSearchState((prev) => ({
          ...prev,
          isSearching: false,
          results: page === 1 ? searchData.results : [...prev.results, ...searchData.results],
          total: searchData.total,
          currentPage: searchData.page,
          totalPages: searchData.totalPages,
        }));

        // Save search analytics
        if (searchState.filters.query && token) {
          try {
            await saveSearchQuery(
              searchState.filters.query,
              searchState.filters,
              searchData.total,
              token
            );
          } catch (error) {
            console.warn("Error saving search analytics:", error);
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error en la búsqueda";
        setSearchState((prev) => ({
          ...prev,
          isSearching: false,
          error: errorMessage,
        }));
        console.error("Search error:", error);
      }
    },
    [searchState.filters, token]
  );

  const loadMore = useCallback(() => {
    if (searchState.currentPage < searchState.totalPages && !searchState.isSearching) {
      search(searchState.currentPage + 1);
    }
  }, [search, searchState.currentPage, searchState.totalPages, searchState.isSearching]);

  const getUserLocation = useCallback(async () => {
    try {
      const coordinates = await getCurrentLocation();
      // Convert to search coordinates format
      const searchCoords = {
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      };
      updateFilters({ coordinates: searchCoords });
      return searchCoords;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error obteniendo ubicación";
      setSearchState((prev) => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, [updateFilters]);

  const setSortBy = useCallback(
    (sortBy: SortOption) => {
      updateFilters({ sortBy });
    },
    [updateFilters]
  );

  const setResourceTypes = useCallback(
    (resourceTypes: ResourceType[]) => {
      updateFilters({ resourceTypes });
    },
    [updateFilters]
  );

  const setLocation = useCallback(
    (location: string, coordinates?: Coordinates) => {
      updateFilters({ location, coordinates });
    },
    [updateFilters]
  );

  const setRadius = useCallback(
    (radius: number) => {
      updateFilters({ radius });
    },
    [updateFilters]
  );

  const setMinRating = useCallback(
    (minRating: number) => {
      updateFilters({ minRating });
    },
    [updateFilters]
  );

  const setBudgetRange = useCallback(
    (min?: number, max?: number) => {
      updateFilters({ budget: { min, max } });
    },
    [updateFilters]
  );

  const setQuery = useCallback(
    (query: string) => {
      updateFilters({ query });
    },
    [updateFilters]
  );

  const hasActiveFilters = useCallback(() => {
    const { query, resourceTypes, location, minRating, budget } = searchState.filters;
    return !!(
      query ||
      resourceTypes.length > 0 ||
      location ||
      minRating > 0 ||
      budget?.min ||
      budget?.max
    );
  }, [searchState.filters]);

  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    const { query, resourceTypes, location, minRating, budget } = searchState.filters;

    if (query) count++;
    if (resourceTypes.length > 0) count++;
    if (location) count++;
    if (minRating > 0) count++;
    if (budget?.min || budget?.max) count++;

    return count;
  }, [searchState.filters]);

  return {
    // State
    searchState,
    suggestions,
    aggregations,

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
    canLoadMore: searchState.currentPage < searchState.totalPages,
    hasResults: searchState.results.length > 0,
    isEmpty: !searchState.isSearching && searchState.results.length === 0 && hasActiveFilters(),
  };
}

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
      // Convert to search coordinates format for state
      const searchCoords = {
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
