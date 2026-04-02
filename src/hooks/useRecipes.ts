"use client";

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as recipesApi from "@/lib/api/recipes";
import type { Recipe, CreateRecipeData, RecipeReview } from "@/lib/api/recipes";
import { extractListData, extractItemData } from "@/lib/api/config";
import { queryKeys } from "@/lib/api/queryKeys";

// Base list query
export function useRecipes(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  difficulty?: string;
}) {
  return useQuery({
    queryKey: queryKeys.recipes.list(params as Record<string, unknown>),
    queryFn: async ({ signal }) => {
      const response = await recipesApi.getRecipes(params, signal);
      return extractListData<Recipe>(response);
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
    queryKey: queryKeys.recipes.infinite({
      search: params?.search,
      category: params?.category,
      difficulty: params?.difficulty,
      limit,
    }),
    queryFn: async ({ pageParam }) => {
      const response = await recipesApi.getRecipes({
        page: pageParam,
        limit,
        search: params?.search,
        category: params?.category,
        difficulty: params?.difficulty,
      });
      return extractListData<Recipe>(response);
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
    queryKey: queryKeys.recipes.detail(id),
    queryFn: async ({ signal }) => {
      const response = await recipesApi.getRecipe(id, signal);
      return extractItemData<Recipe>(response);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Mutations with automatic cache invalidation
export function useRecipeMutations() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.recipes.all });
  };

  const createRecipe = useMutation({
    mutationFn: (data: CreateRecipeData) => recipesApi.createRecipe(data),
    onSuccess: invalidateAll,
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
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.detail(variables.id) });
      invalidateAll();
    },
  });

  const deleteRecipe = useMutation({
    mutationFn: ({ id, token }: { id: string; token?: string }) =>
      recipesApi.deleteRecipe(id, token),
    onSuccess: invalidateAll,
  });

  const addReview = useMutation({
    mutationFn: ({ id, review, token }: { id: string; review: RecipeReview; token?: string }) =>
      recipesApi.addRecipeReview(id, review, token),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.detail(variables.id) });
      invalidateAll();
    },
  });

  return {
    createRecipe,
    updateRecipe,
    deleteRecipe,
    addReview,
  };
}
