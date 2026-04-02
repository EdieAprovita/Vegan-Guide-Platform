"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as sanctuariesApi from "@/lib/api/sanctuaries";
import type {
  Sanctuary,
  CreateSanctuaryData,
  SanctuaryReview,
  SanctuarySearchParams,
} from "@/lib/api/sanctuaries";
import { extractListData, extractItemData } from "@/lib/api/config";
import { useUserLocation } from "@/hooks/useGeolocation";
import { queryKeys } from "@/lib/api/queryKeys";

// Base list query
export function useSanctuaries(params?: SanctuarySearchParams) {
  return useQuery({
    queryKey: queryKeys.sanctuaries.list(params as Record<string, unknown>),
    queryFn: async ({ signal }) => {
      const response = await sanctuariesApi.getSanctuaries(params, signal);
      return extractListData<Sanctuary>(response);
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Single sanctuary query
export function useSanctuary(id: string) {
  return useQuery({
    queryKey: queryKeys.sanctuaries.detail(id),
    queryFn: async ({ signal }) => {
      const response = await sanctuariesApi.getSanctuary(id, signal);
      return extractItemData<Sanctuary>(response);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para búsqueda por proximidad
export function useNearbySanctuaries(params?: {
  radius?: number;
  limit?: number;
  typeofSanctuary?: string;
  minRating?: number;
  enabled?: boolean;
}) {
  const { userCoords, getCurrentPosition } = useUserLocation();

  return useQuery({
    queryKey: queryKeys.sanctuaries.nearby(userCoords, params as Record<string, unknown>),
    queryFn: async ({ signal }) => {
      if (!userCoords) {
        await getCurrentPosition();
        return [];
      }

      const response = await sanctuariesApi.getNearbySanctuaries({
        latitude: userCoords.lat,
        longitude: userCoords.lng,
        radius: params?.radius || 5,
        limit: params?.limit || 20,
        typeofSanctuary: params?.typeofSanctuary,
        minRating: params?.minRating,
      }, signal);

      return extractListData<Sanctuary>(response);
    },
    enabled: params?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook para búsqueda por tipo de santuario
export function useSanctuariesByType(
  typeofSanctuary: string,
  params?: {
    page?: number;
    limit?: number;
    includeLocation?: boolean;
    enabled?: boolean;
  }
) {
  const { userCoords } = useUserLocation();

  return useQuery({
    queryKey: queryKeys.sanctuaries.byType(typeofSanctuary, userCoords, params as Record<string, unknown>),
    queryFn: async ({ signal }) => {
      const searchParams = {
        page: params?.page,
        limit: params?.limit,
      };

      if (params?.includeLocation && userCoords) {
        Object.assign(searchParams, {
          latitude: userCoords.lat,
          longitude: userCoords.lng,
          radius: 10,
        });
      }

      const response = await sanctuariesApi.getSanctuariesByType(typeofSanctuary, searchParams, signal);
      return extractListData<Sanctuary>(response);
    },
    enabled: params?.enabled !== false && !!typeofSanctuary,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook para búsqueda avanzada
export function useAdvancedSanctuarySearch(params: {
  search?: string;
  typeofSanctuary?: string[];
  minRating?: number;
  radius?: number;
  sortBy?: "distance" | "rating" | "sanctuaryName" | "createdAt";
  includeLocation?: boolean;
  enabled?: boolean;
}) {
  const { userCoords } = useUserLocation();

  return useQuery({
    queryKey: queryKeys.sanctuaries.search(userCoords, params as Record<string, unknown>),
    queryFn: async ({ signal }) => {
      const searchParams = {
        search: params.search,
        typeofSanctuary: params.typeofSanctuary,
        minRating: params.minRating,
        sortBy: params.sortBy || ("rating" as const),
        limit: 50,
      };

      if (params.includeLocation && userCoords) {
        Object.assign(searchParams, {
          latitude: userCoords.lat,
          longitude: userCoords.lng,
          radius: params.radius || 10,
        });
      }

      const response = await sanctuariesApi.getAdvancedSanctuaries(searchParams, signal);
      return extractListData<Sanctuary>(response);
    },
    enabled: params.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook para mutaciones con invalidación automática
export function useSanctuaryMutations() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.sanctuaries.all });
  };

  const createSanctuary = useMutation({
    mutationFn: ({ data, token }: { data: CreateSanctuaryData; token?: string }) =>
      sanctuariesApi.createSanctuary(data, token),
    onSuccess: invalidateAll,
  });

  const updateSanctuary = useMutation({
    mutationFn: ({
      id,
      data,
      token,
    }: {
      id: string;
      data: Partial<CreateSanctuaryData>;
      token?: string;
    }) => sanctuariesApi.updateSanctuary(id, data, token),
    onSuccess: invalidateAll,
  });

  const deleteSanctuary = useMutation({
    mutationFn: ({ id, token }: { id: string; token?: string }) =>
      sanctuariesApi.deleteSanctuary(id, token),
    onSuccess: invalidateAll,
  });

  const addReview = useMutation({
    mutationFn: ({ id, review, token }: { id: string; review: SanctuaryReview; token?: string }) =>
      sanctuariesApi.addSanctuaryReview(id, review, token),
    onSuccess: invalidateAll,
  });

  return {
    createSanctuary,
    updateSanctuary,
    deleteSanctuary,
    addReview,
  };
}
