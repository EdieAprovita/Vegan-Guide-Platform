"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as marketsApi from "@/lib/api/markets";
import type { Market, CreateMarketData, MarketReview, MarketSearchParams } from "@/lib/api/markets";
import { processBackendResponse } from "@/lib/api/config";
import { useUserLocation } from "@/hooks/useGeolocation";

// Base list query
export function useMarkets(params?: MarketSearchParams) {
  return useQuery({
    queryKey: ["markets", params],
    queryFn: async () => {
      const response = await marketsApi.getMarkets(params);
      const data = processBackendResponse<Market>(response);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Single market query
export function useMarket(id: string) {
  return useQuery({
    queryKey: ["markets", id],
    queryFn: async () => {
      const response = await marketsApi.getMarket(id);
      return processBackendResponse<Market>(response) as Market;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para búsqueda por proximidad
export function useNearbyMarkets(params?: {
  radius?: number;
  limit?: number;
  products?: string;
  minRating?: number;
  enabled?: boolean;
}) {
  const { userCoords, getCurrentPosition } = useUserLocation();

  return useQuery({
    queryKey: ["nearbyMarkets", userCoords, params],
    queryFn: async () => {
      if (!userCoords) {
        await getCurrentPosition();
        return [];
      }

      const response = await marketsApi.getNearbyMarkets({
        latitude: userCoords.lat,
        longitude: userCoords.lng,
        radius: params?.radius || 5,
        limit: params?.limit || 20,
        products: params?.products,
        minRating: params?.minRating,
      });

      return processBackendResponse<Market>(response) as Market[];
    },
    enabled: params?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook para búsqueda por productos
export function useMarketsByProducts(
  products: string,
  params?: {
    page?: number;
    limit?: number;
    includeLocation?: boolean;
    enabled?: boolean;
  }
) {
  const { userCoords } = useUserLocation();

  return useQuery({
    queryKey: ["marketsByProducts", products, userCoords, params],
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

      const response = await marketsApi.getMarketsByProducts(products, searchParams);
      return processBackendResponse<Market>(response) as Market[];
    },
    enabled: params?.enabled !== false && !!products,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook para búsqueda avanzada con paginación
export function useAdvancedMarketSearch(params: {
  search?: string;
  products?: string[];
  minRating?: number;
  radius?: number;
  sortBy?: "distance" | "rating" | "marketName" | "createdAt";
  includeLocation?: boolean;
  enabled?: boolean;
}) {
  const { userCoords } = useUserLocation();

  return useQuery({
    queryKey: ["advancedMarketSearch", userCoords, params],
    queryFn: async () => {
      const searchParams = {
        search: params.search,
        products: params.products,
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

      const response = await marketsApi.getAdvancedMarkets(searchParams);
      return processBackendResponse<Market>(response) as Market[];
    },
    enabled: params.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook para mutaciones con invalidación automática
export function useMarketMutations() {
  const queryClient = useQueryClient();

  const createMarket = useMutation({
    mutationFn: ({ data, token }: { data: CreateMarketData; token?: string }) =>
      marketsApi.createMarket(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["markets"] });
      queryClient.invalidateQueries({ queryKey: ["nearbyMarkets"] });
      queryClient.invalidateQueries({ queryKey: ["marketsByProducts"] });
      queryClient.invalidateQueries({ queryKey: ["advancedMarketSearch"] });
    },
  });

  const updateMarket = useMutation({
    mutationFn: ({
      id,
      data,
      token,
    }: {
      id: string;
      data: Partial<CreateMarketData>;
      token?: string;
    }) => marketsApi.updateMarket(id, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["markets"] });
      queryClient.invalidateQueries({ queryKey: ["nearbyMarkets"] });
      queryClient.invalidateQueries({ queryKey: ["marketsByProducts"] });
      queryClient.invalidateQueries({ queryKey: ["advancedMarketSearch"] });
    },
  });

  const deleteMarket = useMutation({
    mutationFn: ({ id, token }: { id: string; token?: string }) =>
      marketsApi.deleteMarket(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["markets"] });
      queryClient.invalidateQueries({ queryKey: ["nearbyMarkets"] });
      queryClient.invalidateQueries({ queryKey: ["marketsByProducts"] });
      queryClient.invalidateQueries({ queryKey: ["advancedMarketSearch"] });
    },
  });

  const addReview = useMutation({
    mutationFn: ({ id, review, token }: { id: string; review: MarketReview; token?: string }) =>
      marketsApi.addMarketReview(id, review, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["markets"] });
      queryClient.invalidateQueries({ queryKey: ["nearbyMarkets"] });
      queryClient.invalidateQueries({ queryKey: ["marketsByProducts"] });
      queryClient.invalidateQueries({ queryKey: ["advancedMarketSearch"] });
    },
  });

  return {
    createMarket,
    updateMarket,
    deleteMarket,
    addReview,
  };
}
