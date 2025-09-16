"use client";

import { create } from "zustand";
import * as postsApi from "@/lib/api/posts";
import type { Post, CreatePostData, CreateCommentData, PostSearchParams } from "@/lib/api/posts";
import { useUserLocation } from "@/hooks/useGeolocation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Comment {
  _id: string;
  user: {
    _id: string;
    username: string;
    photo?: string;
  };
  content: string;
  createdAt: string;
}
import { processBackendResponse } from "@/lib/api/config";

interface PostsState {
  posts: Post[];
  currentPost: Post | null;
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  getPosts: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    tags?: string;
    author?: string;
  }) => Promise<void>;
  getPost: (id: string) => Promise<void>;
  createPost: (data: CreatePostData, token?: string) => Promise<void>;
  updatePost: (id: string, data: Partial<CreatePostData>, token?: string) => Promise<void>;
  deletePost: (id: string, token?: string) => Promise<void>;
  likePost: (id: string, token?: string) => Promise<void>;
  unlikePost: (id: string, token?: string) => Promise<void>;
  addComment: (id: string, comment: CreateCommentData, token?: string) => Promise<void>;
}

export const usePosts = create<PostsState>((set) => ({
  posts: [],
  currentPost: null,
  isLoading: false,
  error: null,
  totalPages: 0,
  currentPage: 1,

  getPosts: async (params) => {
    try {
      set({ isLoading: true, error: null });
      const response = await postsApi.getPosts(params);

      // Use the universal helper to process backend response
      const posts = processBackendResponse<Post>(response) as Post[];

      set({
        posts: Array.isArray(posts) ? posts : [],
        totalPages: 1, // Backend doesn't implement pagination yet
        currentPage: 1,
        isLoading: false,
      });
    } catch (err) {
      const error = err as Error;
      console.error("getPosts error:", error);
      set({
        error: error.message,
        isLoading: false,
        posts: [],
      });
      throw error;
    }
  },

  getPost: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await postsApi.getPost(id);
      const post = processBackendResponse<Post>(response) as Post;
      set({ currentPost: post, isLoading: false });
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  createPost: async (data, token) => {
    try {
      set({ isLoading: true, error: null });
      const response = await postsApi.createPost(data, token);
      const post = processBackendResponse<Post>(response) as Post;
      set((state) => ({
        posts: [post, ...state.posts],
        isLoading: false,
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updatePost: async (id, data, token) => {
    try {
      set({ isLoading: true, error: null });
      const response = await postsApi.updatePost(id, data, token);
      const updatedPost = processBackendResponse<Post>(response) as Post;
      set((state) => ({
        posts: state.posts.map((post) => (post._id === id ? updatedPost : post)),
        currentPost: state.currentPost?._id === id ? updatedPost : state.currentPost,
        isLoading: false,
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deletePost: async (id, token) => {
    try {
      set({ isLoading: true, error: null });
      await postsApi.deletePost(id, token);
      set((state) => ({
        posts: state.posts.filter((post) => post._id !== id),
        currentPost: state.currentPost?._id === id ? null : state.currentPost,
        isLoading: false,
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  likePost: async (id, token) => {
    try {
      const response = await postsApi.likePost(id, token);
      // The backend returns the updated likes array
      const likes = processBackendResponse<string[]>(response) as string[];
      set((state) => ({
        posts: state.posts.map((post) => (post._id === id ? { ...post, likes } : post)),
        currentPost:
          state.currentPost?._id === id ? { ...state.currentPost, likes } : state.currentPost,
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message });
      throw error;
    }
  },

  unlikePost: async (id, token) => {
    try {
      const response = await postsApi.unlikePost(id, token);
      // The backend returns the updated likes array
      const likes = processBackendResponse<string[]>(response) as string[];
      set((state) => ({
        posts: state.posts.map((post) => (post._id === id ? { ...post, likes } : post)),
        currentPost:
          state.currentPost?._id === id ? { ...state.currentPost, likes } : state.currentPost,
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message });
      throw error;
    }
  },

  addComment: async (id, comment, token) => {
    try {
      const response = await postsApi.addComment(id, comment, token);
      // The backend returns the updated comments array
      const comments = processBackendResponse<Comment[]>(response) as Comment[];
      set((state) => ({
        posts: state.posts.map((post) => (post._id === id ? { ...post, comments } : post)),
        currentPost:
          state.currentPost?._id === id ? { ...state.currentPost, comments } : state.currentPost,
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message });
      throw error;
    }
  },
}));

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
    queryKey: ["posts", "nearby", userCoords, params],
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

      return processBackendResponse<Post>(response) as Post[];
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
    queryKey: ["posts", "byTags", params, userCoords],
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
      return processBackendResponse<Post>(response) as Post[];
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
    queryKey: ["posts", "advancedSearch", params, userCoords],
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
      return processBackendResponse<Post>(response) as Post[];
    },
    enabled: params.enabled !== false,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}

export function usePostMutations() {
  const queryClient = useQueryClient();

  const createPost = useMutation({
    mutationFn: ({ data, token }: { data: CreatePostData; token?: string }) =>
      postsApi.createPost(data, token),
    onSuccess: () => {
      // Invalidate all posts queries
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const deletePost = useMutation({
    mutationFn: ({ id, token }: { id: string; token?: string }) => postsApi.deletePost(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const likePost = useMutation({
    mutationFn: ({ id, token }: { id: string; token?: string }) => postsApi.likePost(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const unlikePost = useMutation({
    mutationFn: ({ id, token }: { id: string; token?: string }) => postsApi.unlikePost(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
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
