"use client";

import { type LoginFormData } from "@/lib/validations/auth";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";

export function LoginClient() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
        return;
      }

      if (result?.ok) {
        toast.success("Login successful!");
        router.push("/profile");
        router.refresh();
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <LoginForm
        onSubmit={onSubmit}
        isLoading={isLoading}
        onForgotPassword={() => router.push("/forgot-password")}
        onRegister={() => router.push("/register")}
      />
    </AuthLayout>
  );
}
