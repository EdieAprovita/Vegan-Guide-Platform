"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserLocation } from "./useGeolocation";
import { processBackendResponse } from "@/lib/api/config";
import * as businessesApi from "@/lib/api/businesses";
import type {
  Business,
  CreateBusinessData,
  BusinessReview,
  BusinessFilters,
} from "@/lib/api/businesses";
import { queryKeys } from "@/lib/api/queryKeys";

// ---------------------------------------------------------------------------
// useBusinesses — list with optional geolocation injection
// ---------------------------------------------------------------------------

export function useBusinesses(
  filters?: BusinessFilters & {
    useUserLocation?: boolean;
    autoFetch?: boolean;
  }
) {
  const { userCoords } = useUserLocation();

  // Build the effective query params so the query key tracks them accurately
  const resolvedFilters: BusinessFilters = (() => {
    const base: BusinessFilters = { ...filters };
    delete (base as Record<string, unknown>).useUserLocation;
    delete (base as Record<string, unknown>).autoFetch;

    if (
      filters?.useUserLocation &&
      userCoords?.lat !== undefined &&
      userCoords?.lng !== undefined
    ) {
      return {
        ...base,
        lat: userCoords.lat,
        lng: userCoords.lng,
        radius: base.radius ?? 10,
      };
    }

    return base;
  })();

  const query = useQuery({
    queryKey: queryKeys.businesses.list(resolvedFilters as Record<string, unknown>),
    queryFn: async () => {
      const response = await businessesApi.getBusinesses(resolvedFilters);
      const data = processBackendResponse<Business>(response);
      return Array.isArray(data) ? data : [];
    },
    enabled: filters?.autoFetch !== false,
    staleTime: 5 * 60 * 1000,
  });

  return {
    businesses: query.data ?? [],
    loading: query.isLoading,
    error:
      query.error instanceof Error ? query.error.message : query.error ? "An error occurred" : null,
    totalCount: query.data?.length ?? 0,
    refetch: query.refetch,
  };
}

// ---------------------------------------------------------------------------
// useBusiness — single item
// ---------------------------------------------------------------------------

export function useBusiness(id?: string) {
  const query = useQuery({
    queryKey: queryKeys.businesses.detail(id ?? ""),
    queryFn: async () => {
      const response = await businessesApi.getBusiness(id!);
      return processBackendResponse<Business>(response) as Business;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  return {
    business: query.data ?? null,
    loading: query.isLoading,
    error:
      query.error instanceof Error ? query.error.message : query.error ? "An error occurred" : null,
  };
}

// ---------------------------------------------------------------------------
// useNearbyBusinesses — imperative proximity search (local state)
// These hooks are triggered imperatively on demand and do not benefit from
// TanStack Query's caching model, so local state is used intentionally.
// ---------------------------------------------------------------------------

export function useNearbyBusinesses(radius: number = 5) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userCoords, getCurrentPosition } = useUserLocation();

  const searchNearby = async (customCoords?: { lat: number; lng: number }) => {
    const coords = customCoords ?? userCoords;

    if (!coords) {
      try {
        await getCurrentPosition();
        return;
      } catch {
        setError("No se pudo obtener la ubicación");
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      const response = await businessesApi.getBusinessesByProximity(coords.lat, coords.lng, radius);
      const data = Array.isArray(response.data) ? response.data : [response.data];
      setBusinesses(data as Business[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en búsqueda por proximidad");
    } finally {
      setLoading(false);
    }
  };

  return {
    businesses,
    loading,
    error,
    searchNearby,
    userCoords,
  };
}

// ---------------------------------------------------------------------------
// useBusinessSearch — imperative advanced search (local state)
// ---------------------------------------------------------------------------

export function useBusinessSearch() {
  const [results, setResults] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string, filters: BusinessFilters = {}) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await businessesApi.searchBusinesses(query, filters);
      const data = Array.isArray(response.data) ? response.data : [response.data];
      setResults(data as Business[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en la búsqueda");
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return {
    results,
    loading,
    error,
    search,
    clearResults,
  };
}

// ---------------------------------------------------------------------------
// useBusinessMutations — create / update / delete / review
// ---------------------------------------------------------------------------

export function useBusinessMutations() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.businesses.all });
  };

  const createMutation = useMutation({
    mutationFn: ({ data, token }: { data: CreateBusinessData; token?: string }) =>
      token ? businessesApi.createBusiness(data, token) : businessesApi.createBusiness(data),
    onSuccess: invalidateAll,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
      token,
    }: {
      id: string;
      data: Partial<CreateBusinessData>;
      token?: string;
    }) =>
      token
        ? businessesApi.updateBusiness(id, data, token)
        : businessesApi.updateBusiness(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses.detail(id) });
      invalidateAll();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, token }: { id: string; token?: string }) =>
      token ? businessesApi.deleteBusiness(id, token) : businessesApi.deleteBusiness(id),
    onSuccess: invalidateAll,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, review, token }: { id: string; review: BusinessReview; token?: string }) =>
      token
        ? businessesApi.addBusinessReview(id, review, token)
        : businessesApi.addBusinessReview(id, review),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses.detail(id) });
      invalidateAll();
    },
  });

  // Preserve the original imperative call signatures so consumers don't break:
  //   createBusiness(data)  → returns Business
  //   updateBusiness(id, data) → returns Business
  //   deleteBusiness(id)    → void
  //   addReview(id, review) → returns Business
  // The `loading` flag is true when any mutation is in-flight.

  const createBusiness = async (data: CreateBusinessData, token?: string): Promise<Business> => {
    const response = await createMutation.mutateAsync({ data, token });
    return response.data;
  };

  const updateBusiness = async (
    id: string,
    data: Partial<CreateBusinessData>,
    token?: string
  ): Promise<Business> => {
    const response = await updateMutation.mutateAsync({ id, data, token });
    return response.data;
  };

  const deleteBusiness = async (id: string, token?: string): Promise<void> => {
    await deleteMutation.mutateAsync({ id, token });
  };

  const addReview = async (
    id: string,
    review: BusinessReview,
    token?: string
  ): Promise<Business> => {
    const response = await reviewMutation.mutateAsync({ id, review, token });
    return response.data;
  };

  const loading =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    reviewMutation.isPending;

  return {
    createBusiness,
    updateBusiness,
    deleteBusiness,
    addReview,
    loading,
  };
}
