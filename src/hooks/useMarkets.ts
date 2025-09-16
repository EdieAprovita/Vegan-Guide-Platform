"use client";

import { create } from "zustand";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as marketsApi from "@/lib/api/markets";
import type { Market, CreateMarketData, MarketReview, MarketSearchParams } from "@/lib/api/markets";
import { processBackendResponse } from "@/lib/api/config";
import { useUserLocation } from "@/hooks/useGeolocation";

interface MarketsState {
  markets: Market[];
  currentMarket: Market | null;
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  getMarkets: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    products?: string;
    rating?: number;
    location?: string;
  }) => Promise<void>;
  getMarket: (id: string) => Promise<void>;
  createMarket: (data: CreateMarketData, token?: string) => Promise<void>;
  updateMarket: (id: string, data: Partial<CreateMarketData>, token?: string) => Promise<void>;
  deleteMarket: (id: string, token?: string) => Promise<void>;
  addMarketReview: (id: string, review: MarketReview, token?: string) => Promise<void>;
}

export const useMarkets = create<MarketsState>((set) => ({
  markets: [],
  currentMarket: null,
  isLoading: false,
  error: null,
  totalPages: 0,
  currentPage: 1,

  getMarkets: async (params) => {
    try {
      set({ isLoading: true, error: null });
      const response = await marketsApi.getMarkets(params);

      // Use the universal helper to process backend response
      const markets = processBackendResponse<Market>(response) as Market[];

      set({
        markets: Array.isArray(markets) ? markets : [],
        totalPages: 1, // Backend doesn't implement pagination yet
        currentPage: 1,
        isLoading: false,
      });
    } catch (err) {
      const error = err as Error;
      console.error("getMarkets error:", error);
      set({
        error: error.message,
        isLoading: false,
        markets: [],
      });
      throw error;
    }
  },

  getMarket: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await marketsApi.getMarket(id);
      const market = processBackendResponse<Market>(response) as Market;
      set({ currentMarket: market, isLoading: false });
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  createMarket: async (data, token) => {
    try {
      set({ isLoading: true, error: null });
      const response = await marketsApi.createMarket(data, token);
      const market = processBackendResponse<Market>(response) as Market;
      set((state) => ({
        markets: [market, ...state.markets],
        isLoading: false,
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateMarket: async (id, data, token) => {
    try {
      set({ isLoading: true, error: null });
      const response = await marketsApi.updateMarket(id, data, token);
      const updatedMarket = processBackendResponse<Market>(response) as Market;
      set((state) => ({
        markets: state.markets.map((market) => (market._id === id ? updatedMarket : market)),
        currentMarket: state.currentMarket?._id === id ? updatedMarket : state.currentMarket,
        isLoading: false,
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteMarket: async (id, token) => {
    try {
      set({ isLoading: true, error: null });
      await marketsApi.deleteMarket(id, token);
      set((state) => ({
        markets: state.markets.filter((market) => market._id !== id),
        currentMarket: state.currentMarket?._id === id ? null : state.currentMarket,
        isLoading: false,
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  addMarketReview: async (id, review, token) => {
    try {
      set({ isLoading: true, error: null });
      const response = await marketsApi.addMarketReview(id, review, token);
      const updatedMarket = processBackendResponse<Market>(response) as Market;
      set((state) => ({
        markets: state.markets.map((market) => (market._id === id ? updatedMarket : market)),
        currentMarket: state.currentMarket?._id === id ? updatedMarket : state.currentMarket,
        isLoading: false,
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
}));

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
