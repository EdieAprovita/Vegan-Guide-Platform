"use client";

import { create } from "zustand";
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

interface SanctuariesState {
  sanctuaries: Sanctuary[];
  currentSanctuary: Sanctuary | null;
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  getSanctuaries: (params?: SanctuarySearchParams) => Promise<void>;
  getSanctuary: (id: string) => Promise<void>;
  createSanctuary: (data: CreateSanctuaryData, token?: string) => Promise<void>;
  updateSanctuary: (
    id: string,
    data: Partial<CreateSanctuaryData>,
    token?: string
  ) => Promise<void>;
  deleteSanctuary: (id: string, token?: string) => Promise<void>;
  addSanctuaryReview: (id: string, review: SanctuaryReview, token?: string) => Promise<void>;
}

export const useSanctuaries = create<SanctuariesState>((set) => ({
  sanctuaries: [],
  currentSanctuary: null,
  isLoading: false,
  error: null,
  totalPages: 0,
  currentPage: 1,

  getSanctuaries: async (params) => {
    try {
      set({ isLoading: true, error: null });
      const response = await sanctuariesApi.getSanctuaries(params);

      // Use the universal helper to process backend response
      const sanctuaries = processBackendResponse<Sanctuary>(response) as Sanctuary[];

      set({
        sanctuaries: Array.isArray(sanctuaries) ? sanctuaries : [],
        totalPages: 1, // Backend doesn't implement pagination yet
        currentPage: 1,
        isLoading: false,
      });
    } catch (err) {
      const error = err as Error;
      console.error("getSanctuaries error:", error);
      set({
        error: error.message,
        isLoading: false,
        sanctuaries: [],
      });
      throw error;
    }
  },

  getSanctuary: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await sanctuariesApi.getSanctuary(id);
      const sanctuary = processBackendResponse<Sanctuary>(response) as Sanctuary;
      set({ currentSanctuary: sanctuary, isLoading: false });
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  createSanctuary: async (data, token) => {
    try {
      set({ isLoading: true, error: null });
      const response = await sanctuariesApi.createSanctuary(data, token);
      const sanctuary = processBackendResponse<Sanctuary>(response) as Sanctuary;
      set((state) => ({
        sanctuaries: [sanctuary, ...state.sanctuaries],
        isLoading: false,
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateSanctuary: async (id, data, token) => {
    try {
      set({ isLoading: true, error: null });
      const response = await sanctuariesApi.updateSanctuary(id, data, token);
      const updatedSanctuary = processBackendResponse<Sanctuary>(response) as Sanctuary;
      set((state) => ({
        sanctuaries: state.sanctuaries.map((sanctuary) =>
          sanctuary._id === id ? updatedSanctuary : sanctuary
        ),
        currentSanctuary:
          state.currentSanctuary?._id === id ? updatedSanctuary : state.currentSanctuary,
        isLoading: false,
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteSanctuary: async (id, token) => {
    try {
      set({ isLoading: true, error: null });
      await sanctuariesApi.deleteSanctuary(id, token);
      set((state) => ({
        sanctuaries: state.sanctuaries.filter((sanctuary) => sanctuary._id !== id),
        currentSanctuary: state.currentSanctuary?._id === id ? null : state.currentSanctuary,
        isLoading: false,
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  addSanctuaryReview: async (id, review, token) => {
    try {
      set({ isLoading: true, error: null });
      const response = await sanctuariesApi.addSanctuaryReview(id, review, token);
      const updatedSanctuary = processBackendResponse<Sanctuary>(response) as Sanctuary;
      set((state) => ({
        sanctuaries: state.sanctuaries.map((sanctuary) =>
          sanctuary._id === id ? updatedSanctuary : sanctuary
        ),
        currentSanctuary:
          state.currentSanctuary?._id === id ? updatedSanctuary : state.currentSanctuary,
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
