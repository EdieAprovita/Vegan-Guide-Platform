"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/lib/store/auth";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { checkAuth } = useAuth();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Only check authentication if we have a stored user but no authentication state
    // This prevents unnecessary API calls on initial load
    if (!isAuthenticated && user) {
      checkAuth();
    }
  }, [checkAuth, isAuthenticated, user]);

  return <>{children}</>;
}
