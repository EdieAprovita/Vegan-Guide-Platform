import { create } from "zustand";

/**
 * UI-only auth store — tracks loading states and modal visibility.
 * Session identity (user, isAuthenticated) is owned exclusively by NextAuth's
 * useSession() to prevent divergence between the two auth sources.
 */
type AuthUIState = {
  isLoggingIn: boolean;
  isRegistering: boolean;
  isSendingResetEmail: boolean;
  isUpdatingProfile: boolean;
  authModalOpen: boolean;
  authModalView: "login" | "register" | "forgot-password";
};

type AuthUIActions = {
  setIsLoggingIn: (value: boolean) => void;
  setIsRegistering: (value: boolean) => void;
  setIsSendingResetEmail: (value: boolean) => void;
  setIsUpdatingProfile: (value: boolean) => void;
  setAuthModalOpen: (value: boolean) => void;
  setAuthModalView: (view: "login" | "register" | "forgot-password") => void;
};

export const useAuthStore = create<AuthUIState & AuthUIActions>((set) => ({
  isLoggingIn: false,
  isRegistering: false,
  isSendingResetEmail: false,
  isUpdatingProfile: false,
  authModalOpen: false,
  authModalView: "login",
  setIsLoggingIn: (value) => set({ isLoggingIn: value }),
  setIsRegistering: (value) => set({ isRegistering: value }),
  setIsSendingResetEmail: (value) => set({ isSendingResetEmail: value }),
  setIsUpdatingProfile: (value) => set({ isUpdatingProfile: value }),
  setAuthModalOpen: (value) => set({ authModalOpen: value }),
  setAuthModalView: (view) => set({ authModalView: view }),
}));
