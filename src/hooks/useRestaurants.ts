"use client";

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

// Base list query
export function useRestaurants(params?: RestaurantSearchParams) {
  return useQuery({
    queryKey: ["restaurants", params],
    queryFn: async () => {
      const response = await restaurantsApi.getRestaurants(params);
      const data = processBackendResponse<Restaurant>(response);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Single restaurant query
export function useRestaurant(id: string) {
  return useQuery({
    queryKey: ["restaurants", id],
    queryFn: async () => {
      const response = await restaurantsApi.getRestaurant(id);
      return processBackendResponse<Restaurant>(response) as Restaurant;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Top-rated restaurants query
export function useTopRatedRestaurants(limit = 10) {
  return useQuery({
    queryKey: ["restaurants", "topRated", limit],
    queryFn: async () => {
      const response = await restaurantsApi.getTopRatedRestaurants(limit);
      const data = processBackendResponse<Restaurant>(response);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

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
