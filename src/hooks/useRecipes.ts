"use client";

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as recipesApi from "@/lib/api/recipes";
import type { Recipe, CreateRecipeData, RecipeReview } from "@/lib/api/recipes";
import { processBackendResponse } from "@/lib/api/config";

// Base list query
export function useRecipes(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  difficulty?: string;
}) {
  return useQuery({
    queryKey: ["recipes", params],
    queryFn: async () => {
      const response = await recipesApi.getRecipes(params);
      const data = processBackendResponse<Recipe>(response);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Infinite scroll / load-more query — use this in list views instead of useRecipes
export function useInfiniteRecipes(params?: {
  limit?: number;
  search?: string;
  category?: string;
  difficulty?: string;
}) {
  const limit = params?.limit ?? 12;

  return useInfiniteQuery({
    queryKey: [
      "recipes",
      "infinite",
      {
        search: params?.search,
        category: params?.category,
        difficulty: params?.difficulty,
      },
    ],
    queryFn: async ({ pageParam }) => {
      const response = await recipesApi.getRecipes({
        page: pageParam,
        limit,
        search: params?.search,
        category: params?.category,
        difficulty: params?.difficulty,
      });
      const data = processBackendResponse<Recipe>(response);
      return Array.isArray(data) ? data : [];
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      return lastPage.length === limit ? lastPageParam + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Single recipe query
export function useRecipe(id: string) {
  return useQuery({
    queryKey: ["recipes", id],
    queryFn: async () => {
      const response = await recipesApi.getRecipe(id);
      return processBackendResponse<Recipe>(response) as Recipe;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Mutations with automatic cache invalidation
export function useRecipeMutations() {
  const queryClient = useQueryClient();

  const createRecipe = useMutation({
    mutationFn: (data: CreateRecipeData) => recipesApi.createRecipe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });

  const updateRecipe = useMutation({
    mutationFn: ({
      id,
      data,
      token,
    }: {
      id: string;
      data: Partial<CreateRecipeData>;
      token?: string;
    }) => recipesApi.updateRecipe(id, data, token),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      queryClient.invalidateQueries({ queryKey: ["recipes", variables.id] });
    },
  });

  const deleteRecipe = useMutation({
    mutationFn: ({ id, token }: { id: string; token?: string }) =>
      recipesApi.deleteRecipe(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });

  const addReview = useMutation({
    mutationFn: ({ id, review, token }: { id: string; review: RecipeReview; token?: string }) =>
      recipesApi.addRecipeReview(id, review, token),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      queryClient.invalidateQueries({ queryKey: ["recipes", variables.id] });
    },
  });

  return {
    createRecipe,
    updateRecipe,
    deleteRecipe,
    addReview,
  };
}
