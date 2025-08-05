"use client";

import { create } from "zustand";
import * as postsApi from "@/lib/api/posts";
import type { Post, CreatePostData, CreateCommentData } from "@/lib/api/posts";
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
      console.error('getPosts error:', error);
      set({ 
        error: error.message, 
        isLoading: false,
        posts: []
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
        posts: state.posts.map((post) =>
          post._id === id ? updatedPost : post
        ),
        currentPost:
          state.currentPost?._id === id ? updatedPost : state.currentPost,
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
        posts: state.posts.map((post) =>
          post._id === id ? { ...post, likes } : post
        ),
        currentPost:
          state.currentPost?._id === id 
            ? { ...state.currentPost, likes } 
            : state.currentPost,
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
        posts: state.posts.map((post) =>
          post._id === id ? { ...post, likes } : post
        ),
        currentPost:
          state.currentPost?._id === id 
            ? { ...state.currentPost, likes } 
            : state.currentPost,
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
      const comments = processBackendResponse<any[]>(response) as any[];
      set((state) => ({
        posts: state.posts.map((post) =>
          post._id === id ? { ...post, comments } : post
        ),
        currentPost:
          state.currentPost?._id === id 
            ? { ...state.currentPost, comments } 
            : state.currentPost,
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message });
      throw error;
    }
  },
}));