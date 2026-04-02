"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as postsApi from "@/lib/api/posts";
import type { Post, CreatePostData, CreateCommentData, PostSearchParams } from "@/lib/api/posts";
import { useUserLocation } from "@/hooks/useGeolocation";
import { extractListData, extractItemData } from "@/lib/api/config";
import { queryKeys } from "@/lib/api/queryKeys";

interface Comment {
  _id: string;
  user: {
    _id: string;
    username: string;
    photo?: string;
  };
  text: string;
  createdAt: string;
}

// Base list query
export function usePosts(params?: PostSearchParams) {
  return useQuery({
    queryKey: queryKeys.posts.list(params as Record<string, unknown>),
    queryFn: async () => {
      const response = await postsApi.getPosts(params);
      return extractListData<Post>(response);
    },
    staleTime: 2 * 60 * 1000,
  });
}

// Single post query
export function usePost(id: string) {
  return useQuery({
    queryKey: queryKeys.posts.detail(id),
    queryFn: async () => {
      const response = await postsApi.getPost(id);
      return extractItemData<Post>(response);
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

// Modern React Query hooks for Posts with geolocation
export function useNearbyPosts(params: {
  radius?: number;
  limit?: number;
  tags?: string;
  visibility?: "public" | "local" | "followers";
  enabled?: boolean;
}) {
  const { userCoords } = useUserLocation();

  return useQuery({
    queryKey: queryKeys.posts.nearby(userCoords, params as Record<string, unknown>),
    queryFn: async () => {
      if (!userCoords) {
        throw new Error("Ubicación del usuario requerida");
      }

      const response = await postsApi.getNearbyPosts({
        latitude: userCoords.lat,
        longitude: userCoords.lng,
        radius: params.radius || 5,
        limit: params.limit,
        tags: params.tags,
        visibility: params.visibility,
      });

      return extractListData<Post>(response);
    },
    enabled: !!userCoords && params.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

export function usePostsByTags(params: {
  tags: string;
  includeLocation?: boolean;
  radius?: number;
  limit?: number;
  sortBy?: "createdAt" | "distance" | "likes";
  enabled?: boolean;
}) {
  const { userCoords } = useUserLocation();

  return useQuery({
    queryKey: queryKeys.posts.byTags(params as Record<string, unknown>, userCoords),
    queryFn: async () => {
      const searchParams: Parameters<typeof postsApi.getPostsByTags>[0] = {
        tags: params.tags,
        limit: params.limit,
        sortBy: params.sortBy || "createdAt",
      };

      if (params.includeLocation && userCoords) {
        searchParams.latitude = userCoords.lat;
        searchParams.longitude = userCoords.lng;
        searchParams.radius = params.radius || 10;
      }

      const response = await postsApi.getPostsByTags(searchParams);
      return extractListData<Post>(response);
    },
    enabled: !!params.tags && params.enabled !== false,
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 2,
  });
}

export function useAdvancedPostSearch(params: {
  search?: string;
  tags?: string[];
  author?: string;
  visibility?: "public" | "local" | "followers";
  includeLocation?: boolean;
  radius?: number;
  sortBy?: "createdAt" | "distance" | "likes";
  limit?: number;
  page?: number;
  enabled?: boolean;
}) {
  const { userCoords } = useUserLocation();

  return useQuery({
    queryKey: queryKeys.posts.search(params as Record<string, unknown>, userCoords),
    queryFn: async () => {
      const searchParams: Parameters<typeof postsApi.getAdvancedPosts>[0] = {
        search: params.search,
        tags: params.tags,
        author: params.author,
        visibility: params.visibility,
        sortBy: params.sortBy || "createdAt",
        limit: params.limit || 20,
        page: params.page || 1,
      };

      if (params.includeLocation && userCoords) {
        searchParams.latitude = userCoords.lat;
        searchParams.longitude = userCoords.lng;
        searchParams.radius = params.radius || 10;
      }

      const response = await postsApi.getAdvancedPosts(searchParams);
      return extractListData<Post>(response);
    },
    enabled: params.enabled !== false,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}

export function usePostMutations() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
  };

  const createPost = useMutation({
    mutationFn: ({ data, token }: { data: CreatePostData; token?: string }) =>
      postsApi.createPost(data, token),
    onSuccess: invalidateAll,
  });

  const updatePost = useMutation({
    mutationFn: ({
      id,
      data,
      token,
    }: {
      id: string;
      data: Partial<CreatePostData>;
      token?: string;
    }) => postsApi.updatePost(id, data, token),
    onSuccess: invalidateAll,
  });

  const deletePost = useMutation({
    mutationFn: ({ id, token }: { id: string; token?: string }) => postsApi.deletePost(id, token),
    onSuccess: invalidateAll,
  });

  const likePost = useMutation({
    mutationFn: ({ id, token }: { id: string; token?: string }) => postsApi.likePost(id, token),
    onSuccess: invalidateAll,
  });

  const unlikePost = useMutation({
    mutationFn: ({ id, token }: { id: string; token?: string }) => postsApi.unlikePost(id, token),
    onSuccess: invalidateAll,
  });

  const addComment = useMutation({
    mutationFn: ({
      id,
      comment,
      token,
    }: {
      id: string;
      comment: CreateCommentData;
      token?: string;
    }) => postsApi.addComment(id, comment, token),
    onSuccess: invalidateAll,
  });

  return {
    createPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    addComment,
  };
}
