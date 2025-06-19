"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ResetPasswordForm } from "./reset-password-form"
import { type ResetPasswordFormData } from "@/lib/validations/auth"

export function ResetPasswordClient() {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (data: ResetPasswordFormData) => {
    setError(null)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.message || "Failed to send reset email")
        return
      }

      // The form will show success state
    } catch (error) {
      setError("Something went wrong. Please try again.")
    }
  }

  const handleBackToLogin = () => {
    router.push("/login")
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      <ResetPasswordForm onSubmit={handleSubmit} onBackToLogin={handleBackToLogin} />
    </div>
  )
} 