import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { API_CONFIG } from "./api/config";
import { refreshAccessToken } from "./api/tokenRefresh";

export type UserRole = "user" | "professional" | "admin";

declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
    token?: string;
    refreshToken?: string;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role: UserRole;
    };
  }
}

export const config = {
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const res = await fetch(`${API_CONFIG.BASE_URL}/users/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const response = await res.json();

          if (!res.ok || !response.success) {
            return null;
          }

          const userData = response.data;
          return {
            id: userData._id,
            name: userData.username,
            email: userData.email,
            image: userData.photo,
            role: userData.role,
            token: userData.token,
            refreshToken: userData.refreshToken,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as UserRole;
        token.backendToken = user.token;
        token.backendRefreshToken = user.refreshToken;
        token.backendTokenExpiry = Date.now() + 14 * 60 * 1000; // ~14 min (access token is 15 min)
      }

      const expiry = (token.backendTokenExpiry as number) ?? 0;
      const REFRESH_MARGIN = 60 * 1000; // Refresh 1 min before expiry to avoid race conditions
      if (Date.now() >= expiry - REFRESH_MARGIN && token.backendRefreshToken) {
        try {
          const newTokens = await refreshAccessToken(token.backendRefreshToken as string);
          token.backendToken = newTokens.accessToken;
          // Only update refresh token if returned in body; otherwise it's in HttpOnly cookie
          if (newTokens.refreshToken) {
            token.backendRefreshToken = newTokens.refreshToken;
          }
          token.backendTokenExpiry = Date.now() + 14 * 60 * 1000;
        } catch (error) {
          console.error("Failed to refresh access token:", error);
          token.error = "RefreshTokenError";
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        // Backend token stays in the JWT only (server-side).
        // Use API route handlers to proxy authenticated requests.
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
