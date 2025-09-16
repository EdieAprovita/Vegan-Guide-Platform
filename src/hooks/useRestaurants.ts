"use client";

import { create } from "zustand";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as restaurantsApi from "@/lib/api/restaurants";
import type {
  Restaurant,
  CreateRestaurantData,
  RestaurantReview,
  RestaurantSearchParams,
} from "@/lib/api/restaurants";
import { processBackendResponse } from "@/lib/api/config";
import { useUserLocation } from "@/hooks/useGeolocation";

interface RestaurantsState {
  restaurants: Restaurant[];
  currentRestaurant: Restaurant | null;
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  getRestaurants: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    cuisine?: string;
    rating?: number;
    location?: string;
  }) => Promise<void>;
  getRestaurant: (id: string) => Promise<void>;
  getTopRatedRestaurants: (limit?: number) => Promise<void>;
  createRestaurant: (data: CreateRestaurantData, token?: string) => Promise<void>;
  updateRestaurant: (
    id: string,
    data: Partial<CreateRestaurantData>,
    token?: string
  ) => Promise<void>;
  deleteRestaurant: (id: string, token?: string) => Promise<void>;
  addRestaurantReview: (id: string, review: RestaurantReview, token?: string) => Promise<void>;
}

export const useRestaurants = create<RestaurantsState>((set) => ({
  restaurants: [],
  currentRestaurant: null,
  isLoading: false,
  error: null,
  totalPages: 0,
  currentPage: 1,

  getRestaurants: async (params) => {
    try {
      set({ isLoading: true, error: null });
      const response = await restaurantsApi.getRestaurants(params);

      // Use the universal helper to process backend response
      const restaurants = processBackendResponse<Restaurant>(response) as Restaurant[];

      set({
        restaurants: Array.isArray(restaurants) ? restaurants : [],
        totalPages: 1, // Backend doesn't implement pagination yet
        currentPage: 1,
        isLoading: false,
      });
    } catch (err) {
      const error = err as Error;
      console.error("getRestaurants error:", error);
      set({
        error: error.message,
        isLoading: false,
        restaurants: [],
      });
      throw error;
    }
  },

  getRestaurant: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await restaurantsApi.getRestaurant(id);
      const restaurant = processBackendResponse<Restaurant>(response) as Restaurant;
      set({ currentRestaurant: restaurant, isLoading: false });
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  getTopRatedRestaurants: async (limit = 10) => {
    try {
      set({ isLoading: true, error: null });
      const response = await restaurantsApi.getTopRatedRestaurants(limit);
      const restaurants = processBackendResponse<Restaurant>(response) as Restaurant[];
      set({
        restaurants: Array.isArray(restaurants) ? restaurants : [],
        isLoading: false,
      });
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  createRestaurant: async (data, token) => {
    try {
      set({ isLoading: true, error: null });
      const response = await restaurantsApi.createRestaurant(data, token);
      const restaurant = processBackendResponse<Restaurant>(response) as Restaurant;
      set((state) => ({
        restaurants: [restaurant, ...state.restaurants],
        isLoading: false,
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateRestaurant: async (id, data, token) => {
    try {
      set({ isLoading: true, error: null });
      const response = await restaurantsApi.updateRestaurant(id, data, token);
      const updatedRestaurant = processBackendResponse<Restaurant>(response) as Restaurant;
      set((state) => ({
        restaurants: state.restaurants.map((restaurant) =>
          restaurant._id === id ? updatedRestaurant : restaurant
        ),
        currentRestaurant:
          state.currentRestaurant?._id === id ? updatedRestaurant : state.currentRestaurant,
        isLoading: false,
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteRestaurant: async (id, token) => {
    try {
      set({ isLoading: true, error: null });
      await restaurantsApi.deleteRestaurant(id, token);
      set((state) => ({
        restaurants: state.restaurants.filter((restaurant) => restaurant._id !== id),
        currentRestaurant: state.currentRestaurant?._id === id ? null : state.currentRestaurant,
        isLoading: false,
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  addRestaurantReview: async (id, review, token) => {
    try {
      set({ isLoading: true, error: null });
      const response = await restaurantsApi.addRestaurantReview(id, review, token);
      const updatedRestaurant = processBackendResponse<Restaurant>(response) as Restaurant;
      set((state) => ({
        restaurants: state.restaurants.map((restaurant) =>
          restaurant._id === id ? updatedRestaurant : restaurant
        ),
        currentRestaurant:
          state.currentRestaurant?._id === id ? updatedRestaurant : state.currentRestaurant,
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
export function useNearbyRestaurants(params?: {
  radius?: number;
  limit?: number;
  cuisine?: string;
  minRating?: number;
  enabled?: boolean;
}) {
  const { userCoords, getCurrentPosition } = useUserLocation();

  return useQuery({
    queryKey: ["nearbyRestaurants", userCoords, params],
    queryFn: async () => {
      if (!userCoords) {
        await getCurrentPosition();
        return [];
      }

      const response = await restaurantsApi.getNearbyRestaurants({
        latitude: userCoords.lat,
        longitude: userCoords.lng,
        radius: params?.radius || 5,
        limit: params?.limit || 20,
        cuisine: params?.cuisine,
        minRating: params?.minRating,
      });

      return processBackendResponse<Restaurant>(response) as Restaurant[];
    },
    enabled: params?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook para búsqueda por tipo de cocina
export function useRestaurantsByCuisine(
  cuisine: string,
  params?: {
    page?: number;
    limit?: number;
    includeLocation?: boolean;
    enabled?: boolean;
  }
) {
  const { userCoords } = useUserLocation();

  return useQuery({
    queryKey: ["restaurantsByCuisine", cuisine, userCoords, params],
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

      const response = await restaurantsApi.getRestaurantsByCuisine(cuisine, searchParams);
      return processBackendResponse<Restaurant>(response) as Restaurant[];
    },
    enabled: params?.enabled !== false && !!cuisine,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook para búsqueda avanzada
export function useAdvancedRestaurantSearch(params: {
  search?: string;
  cuisine?: string[];
  minRating?: number;
  radius?: number;
  sortBy?: "distance" | "rating" | "restaurantName" | "createdAt";
  includeLocation?: boolean;
  enabled?: boolean;
}) {
  const { userCoords } = useUserLocation();

  return useQuery({
    queryKey: ["advancedRestaurantSearch", userCoords, params],
    queryFn: async () => {
      const searchParams = {
        search: params.search,
        cuisine: params.cuisine,
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

      const response = await restaurantsApi.getAdvancedRestaurants(searchParams);
      return processBackendResponse<Restaurant>(response) as Restaurant[];
    },
    enabled: params.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook para mutaciones con invalidación automática
export function useRestaurantMutations() {
  const queryClient = useQueryClient();

  const createRestaurant = useMutation({
    mutationFn: ({ data, token }: { data: CreateRestaurantData; token?: string }) =>
      restaurantsApi.createRestaurant(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["nearbyRestaurants"] });
      queryClient.invalidateQueries({ queryKey: ["restaurantsByCuisine"] });
      queryClient.invalidateQueries({ queryKey: ["advancedRestaurantSearch"] });
    },
  });

  const updateRestaurant = useMutation({
    mutationFn: ({
      id,
      data,
      token,
    }: {
      id: string;
      data: Partial<CreateRestaurantData>;
      token?: string;
    }) => restaurantsApi.updateRestaurant(id, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["nearbyRestaurants"] });
      queryClient.invalidateQueries({ queryKey: ["restaurantsByCuisine"] });
      queryClient.invalidateQueries({ queryKey: ["advancedRestaurantSearch"] });
    },
  });

  const deleteRestaurant = useMutation({
    mutationFn: ({ id, token }: { id: string; token?: string }) =>
      restaurantsApi.deleteRestaurant(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["nearbyRestaurants"] });
      queryClient.invalidateQueries({ queryKey: ["restaurantsByCuisine"] });
      queryClient.invalidateQueries({ queryKey: ["advancedRestaurantSearch"] });
    },
  });

  const addReview = useMutation({
    mutationFn: ({ id, review, token }: { id: string; review: RestaurantReview; token?: string }) =>
      restaurantsApi.addRestaurantReview(id, review, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["nearbyRestaurants"] });
      queryClient.invalidateQueries({ queryKey: ["restaurantsByCuisine"] });
      queryClient.invalidateQueries({ queryKey: ["advancedRestaurantSearch"] });
    },
  });

  return {
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    addReview,
  };
}
