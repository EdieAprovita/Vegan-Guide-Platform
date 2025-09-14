"use client";

import { create } from "zustand";
import * as restaurantsApi from "@/lib/api/restaurants";
import type { Restaurant, CreateRestaurantData, RestaurantReview } from "@/lib/api/restaurants";
import { processBackendResponse } from "@/lib/api/config";

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
