import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export type UserRole = "user" | "professional" | "admin"

declare module "next-auth" {
  interface User {
    id: string
    role: UserRole
    token?: string // JWT token from backend
  }
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image?: string
      role: UserRole
      token?: string // JWT token for backend requests
    }
  }
}

export const config = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          const data = await res.json()

          if (!res.ok) {
            return null
          }

          return {
            id: data.user._id,
            name: data.user.username,
            email: data.user.email,
            image: data.user.photo,
            role: data.user.role,
            token: data.token, // Store the JWT token from backend
          }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role as UserRole
        token.backendToken = user.token // Store backend JWT in NextAuth token
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.token = token.backendToken as string // Make backend token available in session
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config) 