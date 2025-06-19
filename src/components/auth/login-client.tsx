"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { LoginForm } from "./login-form"
import { type LoginFormData } from "@/lib/validations/auth"

export function LoginClient() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        router.push("/profile")
        router.refresh()
      }
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = () => {
    router.push("/reset-password")
  }

  const handleRegister = () => {
    router.push("/register")
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      <LoginForm
        onSubmit={handleSubmit}
        onForgotPassword={handleForgotPassword}
        onRegister={handleRegister}
        isLoading={isLoading}
      />
    </div>
  )
} 