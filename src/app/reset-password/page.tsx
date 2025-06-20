import { Metadata } from "next"
import { ResetPasswordClient } from "@/components/auth/reset-password-client"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your password",
}

export default async function ResetPasswordPage() {
  const session = await auth()

  if (session?.user) {
    redirect("/profile")
  }

  return (
    <div className="flex min-h-screen">
      <div className="w-1/2 bg-gray-100 flex items-center justify-center p-12">
        <div className="max-w-md w-full">
          <ResetPasswordClient />
        </div>
      </div>
      <div className="w-1/2 bg-green-600 flex items-center justify-center p-12 text-white relative">
        <Image
          src="/logo.svg"
          alt="Vegan Guide Logo"
          width={150}
          height={150}
          className="absolute top-10 left-10"
        />
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
          <p className="text-lg">
            Reset your password to continue your journey with Vegan Guide.
          </p>
        </div>
        <div className="absolute bottom-10 text-center">
          <p>&copy; 2024 Vegan Guide. All rights reserved.</p>
          <p>
            Connecting you to a world of vegan options.
          </p>
        </div>
      </div>
    </div>
  )
} 