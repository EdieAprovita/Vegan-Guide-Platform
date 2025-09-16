import { create } from "zustand";
import { User } from "@/types";

type AuthState = {
  user: User | null;
  token: string | null;
  isLoggingIn: boolean;
  isRegistering: boolean;
  isSendingResetEmail: boolean;
  isUpdatingProfile: boolean;
  authModalOpen: boolean;
  authModalView: "login" | "register" | "forgot-password";
};

type AuthActions = {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setIsLoggingIn: (value: boolean) => void;
  setIsRegistering: (value: boolean) => void;
  setIsSendingResetEmail: (value: boolean) => void;
  setIsUpdatingProfile: (value: boolean) => void;
  setAuthModalOpen: (value: boolean) => void;
  setAuthModalView: (view: "login" | "register" | "forgot-password") => void;
  isAuthenticated: boolean;
};

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  user: null,
  token: null,
  isLoggingIn: false,
  isRegistering: false,
  isSendingResetEmail: false,
  isUpdatingProfile: false,
  authModalOpen: false,
  authModalView: "login",
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setIsLoggingIn: (value) => set({ isLoggingIn: value }),
  setIsRegistering: (value) => set({ isRegistering: value }),
  setIsSendingResetEmail: (value) => set({ isSendingResetEmail: value }),
  setIsUpdatingProfile: (value) => set({ isUpdatingProfile: value }),
  setAuthModalOpen: (value) => set({ authModalOpen: value }),
  setAuthModalView: (view) => set({ authModalView: view }),
  get isAuthenticated() {
    return !!get().user && !!get().token;
  },
}));
