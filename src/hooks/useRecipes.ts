"use client";

import { create } from "zustand";
import * as recipesApi from "@/lib/api/recipes";
import type { Recipe, CreateRecipeData } from "@/lib/api/recipes";

interface RecipesState {
  recipes: Recipe[];
  currentRecipe: Recipe | null;
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  getRecipes: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    difficulty?: string;
  }) => Promise<void>;
  getRecipe: (id: string) => Promise<void>;
  createRecipe: (data: CreateRecipeData) => Promise<void>;
  updateRecipe: (id: string, data: Partial<CreateRecipeData>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  rateRecipe: (id: string, rating: number) => Promise<void>;
}

export const useRecipes = create<RecipesState>((set) => ({
  recipes: [],
  currentRecipe: null,
  isLoading: false,
  error: null,
  totalPages: 0,
  currentPage: 1,

  getRecipes: async (params) => {
    try {
      set({ isLoading: true, error: null });
      const data = await recipesApi.getRecipes(params);
      set({
        recipes: data.recipes,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
        isLoading: false,
      });
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  getRecipe: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const recipe = await recipesApi.getRecipe(id);
      set({ currentRecipe: recipe, isLoading: false });
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  createRecipe: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const recipe = await recipesApi.createRecipe(data);
      set((state) => ({
        recipes: [recipe, ...state.recipes],
        isLoading: false,
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateRecipe: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      const updatedRecipe = await recipesApi.updateRecipe(id, data);
      set((state) => ({
        recipes: state.recipes.map((recipe) =>
          recipe._id === id ? updatedRecipe : recipe
        ),
        currentRecipe:
          state.currentRecipe?._id === id ? updatedRecipe : state.currentRecipe,
        isLoading: false,
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteRecipe: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await recipesApi.deleteRecipe(id);
      set((state) => ({
        recipes: state.recipes.filter((recipe) => recipe._id !== id),
        currentRecipe: state.currentRecipe?._id === id ? null : state.currentRecipe,
        isLoading: false,
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  rateRecipe: async (id, rating) => {
    try {
      set({ isLoading: true, error: null });
      const updatedRecipe = await recipesApi.rateRecipe(id, rating);
      set((state) => ({
        recipes: state.recipes.map((recipe) =>
          recipe._id === id ? updatedRecipe : recipe
        ),
        currentRecipe:
          state.currentRecipe?._id === id ? updatedRecipe : state.currentRecipe,
        isLoading: false,
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
})); 