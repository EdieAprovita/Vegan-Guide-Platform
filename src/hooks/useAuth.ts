import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth";
import type {
  LoginFormData,
  RegisterFormData,
  ResetPasswordFormData,
  NewPasswordFormData,
} from "@/lib/validations/auth";

export function useAuth() {
  const {
    setUser,
    setLoading,
    setError,
    logout: logoutStore,
    clearError,
  } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (user) => {
      setUser(user);
      toast.success("Welcome back!");
    },
    onError: (error: Error) => {
      setError(error.message);
      toast.error(error.message);
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (user) => {
      setUser(user);
      toast.success("Account created successfully!");
    },
    onError: (error: Error) => {
      setError(error.message);
      toast.error(error.message);
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: ({ email }: { email: string }) => authApi.forgotPassword(email),
    onSuccess: () => {
      toast.success("Password reset email sent!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({
      token,
      newPassword,
    }: {
      token: string;
      newPassword: string;
    }) => authApi.resetPassword(token, newPassword),
    onSuccess: () => {
      toast.success("Password reset successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logoutStore();
      toast.success("Logged out successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Query for current user - only runs when explicitly called
  const currentUserQuery = useQuery({
    queryKey: ["currentUser"],
    queryFn: authApi.getCurrentUser,
    enabled: false, // Disabled by default
    retry: false,
  });

  // Handle user query results when data changes
  if (currentUserQuery.data) {
    setUser(currentUserQuery.data);
  }

  if (currentUserQuery.error) {
    logoutStore();
  }

  return {
    // Mutations
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    forgotPassword: forgotPasswordMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    logout: logoutMutation.mutate,

    // Loading states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isSendingResetEmail: forgotPasswordMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isLoadingUser: currentUserQuery.isLoading,

    // Error states
    loginError: loginMutation.error,
    registerError: registerMutation.error,

    // Actions
    clearError,
    checkAuth: () => currentUserQuery.refetch(),
  };
}
