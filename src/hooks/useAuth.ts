"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import {
  LoginFormData,
  RegisterFormData,
  ResetPasswordFormData,
  NewPasswordFormData,
} from "@/lib/validations/auth";
import * as authApi from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function useAuthWithRouter() {
  const { data: session, status } = useSession();
  const {
    setUser,
    isLoggingIn,
    setIsLoggingIn,
    isRegistering,
    setIsRegistering,
    isSendingResetEmail,
    setIsSendingResetEmail,
    isUpdatingProfile,
    setIsUpdatingProfile,
    authModalOpen,
    setAuthModalOpen,
    authModalView,
    setAuthModalView,
  } = useAuthStore();
  const router = useRouter();

  const login = async (credentials: LoginFormData) => {
    setIsLoggingIn(true);
    try {
      const result = await signIn("credentials", {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      toast.success("Login successful!");
      setAuthModalOpen(false);
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const register = async (data: RegisterFormData) => {
    setIsRegistering(true);
    try {
      const userData = await authApi.register(data);
      setUser(userData);
      toast.success("Registration successful!");
      setAuthModalOpen(false);
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    } finally {
      setIsRegistering(false);
    }
  };

  const forgotPassword = async (data: ResetPasswordFormData) => {
    setIsSendingResetEmail(true);
    try {
      await authApi.forgotPassword(data);
      toast.success("Password reset link sent to your email.");
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  const resetPassword = async (data: NewPasswordFormData, token: string) => {
    try {
      await authApi.resetPassword(data, token);
      toast.success("Password has been reset successfully.");
      router.push("/login");
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<RegisterFormData>) => {
    if (!session?.user?.id) {
      throw new Error("Not authenticated");
    }

    setIsUpdatingProfile(true);
    try {
      // Use server action instead of directly exposing JWT token to client
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const logout = () => {
    signOut({ redirect: false });
    setUser(null);
    toast.success("Logged out successfully!");
  };

  return {
    user: session?.user,
    isAuthenticated: !!session?.user,
    status,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    isLoggingIn,
    isRegistering,
    isSendingResetEmail,
    isUpdatingProfile,
    authModalOpen,
    setAuthModalOpen,
    authModalView,
    setAuthModalView,
  };
}

// Export useAuth as an alias for useAuthWithRouter for backward compatibility
export const useAuth = useAuthWithRouter;
