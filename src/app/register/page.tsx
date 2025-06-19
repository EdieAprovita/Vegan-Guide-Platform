import { Metadata } from "next"
import { RegisterClient } from "@/components/auth/register-client"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AuthLayout } from "@/components/auth/auth-layout"

export const metadata: Metadata = {
  title: "Register",
  description: "Create a new account",
}

export default async function RegisterPage() {
  const session = await auth()

  if (session?.user) {
    redirect("/profile")
  }

  return (
    <AuthLayout>
      <RegisterClient />
    </AuthLayout>
  )
} 