import { Metadata } from "next";
import { LoginClient } from "@/components/auth/login-client";
import { AuthLayout } from "@/components/auth/auth-layout";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/profile");
  }

  return (
    <AuthLayout>
      <LoginClient />
    </AuthLayout>
  );
}
