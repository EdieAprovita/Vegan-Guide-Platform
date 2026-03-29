"use client";

import React from "react";

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider is kept as a passthrough wrapper for structural compatibility.
 * Session identity is managed exclusively by NextAuth's SessionProvider +
 * useSession(). The previous Zustand-sync logic has been removed to eliminate
 * the dual-source-of-truth bug.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  return <>{children}</>;
}
