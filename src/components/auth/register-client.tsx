"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { RegisterForm } from "./register-form"
import { type RegisterFormData } from "@/lib/validations/auth"

export function RegisterClient() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (data: RegisterFormData) => {
    setError(null)
    setIsLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
          role: data.role,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.message || "Registration failed")
        return
      }

      // Auto login after successful registration
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (signInResult?.error) {
        setError("Registration successful but login failed. Please try logging in.")
      } else {
        router.push("/profile")
        router.refresh()
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = () => {
    router.push("/login")
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      <RegisterForm onSubmit={handleSubmit} onLogin={handleLogin} isLoading={isLoading} />
    </div>
  )
} 