import { apiRequest, BackendResponse } from "./config";
import { SearchFilters, SearchResponse, SearchParams, ResourceType } from "@/types/search";

/**
 * Perform unified search across all resource types
 */
export async function searchUnified(
  params: SearchParams
): Promise<BackendResponse<SearchResponse>> {
  const searchParams = new URLSearchParams();

  // Basic pagination
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());

  // Filters
  if (params.filters) {
    const { filters } = params;

    if (filters.query) searchParams.append("q", filters.query);
    if (filters.resourceTypes && filters.resourceTypes.length > 0) {
      searchParams.append("types", filters.resourceTypes.join(","));
    }
    if (filters.location) searchParams.append("location", filters.location);
    if (filters.radius) searchParams.append("radius", filters.radius.toString());
    if (filters.minRating) searchParams.append("minRating", filters.minRating.toString());
    if (filters.sortBy) searchParams.append("sort", filters.sortBy);

    // Coordinates for geospatial search
    if (filters.coordinates) {
      searchParams.append("lat", filters.coordinates.latitude.toString());
      searchParams.append("lng", filters.coordinates.longitude.toString());
    }

    // Budget range
    if (filters.budget) {
      if (filters.budget.min) searchParams.append("budgetMin", filters.budget.min.toString());
      if (filters.budget.max) searchParams.append("budgetMax", filters.budget.max.toString());
    }

    // Date range
    if (filters.dateRange) {
      if (filters.dateRange.from) searchParams.append("dateFrom", filters.dateRange.from);
      if (filters.dateRange.to) searchParams.append("dateTo", filters.dateRange.to);
    }
  }

  return apiRequest<BackendResponse<SearchResponse>>(`/search?${searchParams.toString()}`);
}

/**
 * Search within a specific resource type
 */
export async function searchByResourceType(
  resourceType: ResourceType,
  params: SearchParams
): Promise<BackendResponse<SearchResponse>> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());

  if (params.filters) {
    const { filters } = params;

    if (filters.query) searchParams.append("q", filters.query);
    if (filters.location) searchParams.append("location", filters.location);
    if (filters.radius) searchParams.append("radius", filters.radius.toString());
    if (filters.minRating) searchParams.append("minRating", filters.minRating.toString());
    if (filters.sortBy) searchParams.append("sort", filters.sortBy);

    if (filters.coordinates) {
      searchParams.append("lat", filters.coordinates.latitude.toString());
      searchParams.append("lng", filters.coordinates.longitude.toString());
    }

    if (filters.budget) {
      if (filters.budget.min) searchParams.append("budgetMin", filters.budget.min.toString());
      if (filters.budget.max) searchParams.append("budgetMax", filters.budget.max.toString());
    }
  }

  return apiRequest<BackendResponse<SearchResponse>>(
    `/search/${resourceType}?${searchParams.toString()}`
  );
}

/**
 * Get search suggestions/autocomplete
 */
export async function getSearchSuggestions(query: string): Promise<BackendResponse<string[]>> {
  const searchParams = new URLSearchParams();
  searchParams.append("q", query);
  searchParams.append("limit", "10");

  return apiRequest<BackendResponse<string[]>>(`/search/suggestions?${searchParams.toString()}`);
}

/**
 * Get popular search terms
 */
export async function getPopularSearches(): Promise<BackendResponse<string[]>> {
  return apiRequest<BackendResponse<string[]>>("/search/popular");
}

/**
 * Get search filters and aggregations
 */
export async function getSearchAggregations(filters?: Partial<SearchFilters>): Promise<
  BackendResponse<{
    resourceTypes: Record<ResourceType, number>;
    locations: Array<{ name: string; count: number }>;
    priceRanges: Array<{ range: string; count: number }>;
    ratings: Record<number, number>;
  }>
> {
  const searchParams = new URLSearchParams();

  if (filters) {
    if (filters.query) searchParams.append("q", filters.query);
    if (filters.resourceTypes && filters.resourceTypes.length > 0) {
      searchParams.append("types", filters.resourceTypes.join(","));
    }
    if (filters.location) searchParams.append("location", filters.location);
    if (filters.radius) searchParams.append("radius", filters.radius.toString());
    if (filters.coordinates) {
      searchParams.append("lat", filters.coordinates.latitude.toString());
      searchParams.append("lng", filters.coordinates.longitude.toString());
    }
  }

  return apiRequest<
    BackendResponse<{
      resourceTypes: Record<ResourceType, number>;
      locations: Array<{ name: string; count: number }>;
      priceRanges: Array<{ range: string; count: number }>;
      ratings: Record<number, number>;
    }>
  >(`/search/aggregations?${searchParams.toString()}`);
}

/**
 * Save search query for analytics/history
 */
export async function saveSearchQuery(
  query: string,
  filters: Partial<SearchFilters>,
  resultCount: number,
  token?: string
): Promise<BackendResponse<void>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return apiRequest<BackendResponse<void>>("/search/analytics", {
    method: "POST",
    headers,
    body: JSON.stringify({
      query,
      filters,
      resultCount,
      timestamp: new Date().toISOString(),
    }),
  });
}
