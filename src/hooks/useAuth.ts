"use client";

import { create } from "zustand";
import { LoginFormData, RegisterFormData } from "@/lib/validations/auth";
import * as authApi from "@/lib/api/auth";

interface User {
  _id: string;
  username: string;
  email: string;
  role: "user" | "professional";
  photo?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  getProfile: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const user = await authApi.login(data);
      set({ user, isLoading: false });
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  register: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const user = await authApi.register(data);
      set({ user, isLoading: false });
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true, error: null });
      await authApi.logout();
      set({ user: null, isLoading: false });
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  getProfile: async () => {
    try {
      set({ isLoading: true, error: null });
      const user = await authApi.getProfile();
      set({ user, isLoading: false });
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
}));
