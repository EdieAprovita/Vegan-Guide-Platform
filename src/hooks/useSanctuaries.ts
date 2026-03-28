"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as sanctuariesApi from "@/lib/api/sanctuaries";
import type {
  Sanctuary,
  CreateSanctuaryData,
  SanctuaryReview,
  SanctuarySearchParams,
} from "@/lib/api/sanctuaries";
import { processBackendResponse } from "@/lib/api/config";
import { useUserLocation } from "@/hooks/useGeolocation";

// Base list query
export function useSanctuaries(params?: SanctuarySearchParams) {
  return useQuery({
    queryKey: ["sanctuaries", params],
    queryFn: async () => {
      const response = await sanctuariesApi.getSanctuaries(params);
      const data = processBackendResponse<Sanctuary>(response);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Single sanctuary query
export function useSanctuary(id: string) {
  return useQuery({
    queryKey: ["sanctuaries", id],
    queryFn: async () => {
      const response = await sanctuariesApi.getSanctuary(id);
      return processBackendResponse<Sanctuary>(response) as Sanctuary;
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
    queryKey: ["nearbySanctuaries", userCoords, params],
    queryFn: async () => {
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
      });

      return processBackendResponse<Sanctuary>(response) as Sanctuary[];
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
    queryKey: ["sanctuariesByType", typeofSanctuary, userCoords, params],
    queryFn: async () => {
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

      const response = await sanctuariesApi.getSanctuariesByType(typeofSanctuary, searchParams);
      return processBackendResponse<Sanctuary>(response) as Sanctuary[];
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
    queryKey: ["advancedSanctuarySearch", userCoords, params],
    queryFn: async () => {
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

      const response = await sanctuariesApi.getAdvancedSanctuaries(searchParams);
      return processBackendResponse<Sanctuary>(response) as Sanctuary[];
    },
    enabled: params.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook para mutaciones con invalidación automática
export function useSanctuaryMutations() {
  const queryClient = useQueryClient();

  const createSanctuary = useMutation({
    mutationFn: ({ data, token }: { data: CreateSanctuaryData; token?: string }) =>
      sanctuariesApi.createSanctuary(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sanctuaries"] });
      queryClient.invalidateQueries({ queryKey: ["nearbySanctuaries"] });
      queryClient.invalidateQueries({ queryKey: ["sanctuariesByType"] });
      queryClient.invalidateQueries({ queryKey: ["advancedSanctuarySearch"] });
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sanctuaries"] });
      queryClient.invalidateQueries({ queryKey: ["nearbySanctuaries"] });
      queryClient.invalidateQueries({ queryKey: ["sanctuariesByType"] });
      queryClient.invalidateQueries({ queryKey: ["advancedSanctuarySearch"] });
    },
  });

  const deleteSanctuary = useMutation({
    mutationFn: ({ id, token }: { id: string; token?: string }) =>
      sanctuariesApi.deleteSanctuary(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sanctuaries"] });
      queryClient.invalidateQueries({ queryKey: ["nearbySanctuaries"] });
      queryClient.invalidateQueries({ queryKey: ["sanctuariesByType"] });
      queryClient.invalidateQueries({ queryKey: ["advancedSanctuarySearch"] });
    },
  });

  const addReview = useMutation({
    mutationFn: ({ id, review, token }: { id: string; review: SanctuaryReview; token?: string }) =>
      sanctuariesApi.addSanctuaryReview(id, review, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sanctuaries"] });
      queryClient.invalidateQueries({ queryKey: ["nearbySanctuaries"] });
      queryClient.invalidateQueries({ queryKey: ["sanctuariesByType"] });
      queryClient.invalidateQueries({ queryKey: ["advancedSanctuarySearch"] });
    },
  });

  return {
    createSanctuary,
    updateSanctuary,
    deleteSanctuary,
    addReview,
  };
}
