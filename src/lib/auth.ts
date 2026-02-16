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
      token?: string;
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

          const data = await res.json();

          if (!res.ok) {
            return null;
          }

          return {
            id: data.user._id,
            name: data.user.username,
            email: data.user.email,
            image: data.user.photo,
            role: data.user.role,
            token: data.token,
            refreshToken: data.refreshToken,
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
      const refreshMargin = 60 * 1000; // refresh 1 minute before expiry to avoid race conditions
      if (Date.now() >= expiry - refreshMargin && token.backendRefreshToken) {
        try {
          const newTokens = await refreshAccessToken(token.backendRefreshToken as string);
          token.backendToken = newTokens.accessToken;
          token.backendRefreshToken = newTokens.refreshToken;
          token.backendTokenExpiry = Date.now() + 14 * 60 * 1000;
        } catch {
          token.error = "RefreshTokenError";
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        // Only expose token for server-side usage, not client-side
        // This prevents XSS token exposure
        session.user.token = token.backendToken as string;
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
