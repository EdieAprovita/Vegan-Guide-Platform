"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/lib/store/auth";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: session, status } = useSession();
  const { setUser } = useAuthStore();

  useEffect(() => {
    // Sync NextAuth session with Zustand store
    if (session?.user) {
      setUser({
        _id: session.user.id,
        username: session.user.name || "",
        email: session.user.email || "",
        role: session.user.role as "user" | "professional" | "admin",
        photo: session.user.image,
        bio: "",
        createdAt: new Date().toISOString(), // Default value since NextAuth doesn't provide this
        isAdmin: session.user.role === "admin", // Now this should work correctly
      });
    } else if (status === "unauthenticated") {
      setUser(null);
    }
  }, [session, status, setUser]);

  return <>{children}</>;
}
