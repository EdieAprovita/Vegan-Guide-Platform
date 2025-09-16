"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  onForgotPassword: () => void;
  onRegister: () => void;
  isLoading: boolean;
}

export function LoginForm({ onSubmit, onForgotPassword, onRegister, isLoading }: LoginFormProps) {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: LoginFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="mx-auto w-full max-w-sm space-y-6 rounded-2xl bg-white/80 p-8 shadow-lg backdrop-blur-sm">
      <div className="space-y-3 text-center">
        <h1 className="font-['Playfair_Display'] text-3xl font-bold tracking-tight text-green-800">
          Welcome Back
        </h1>
        <p className="font-['Playfair_Display'] text-lg text-emerald-800/80">
          Sign in to your Verde Guide account
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-['Playfair_Display'] font-medium text-emerald-900">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="h-11 border-emerald-100 bg-white/90 font-['Playfair_Display'] focus:border-emerald-500 focus:ring-emerald-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-rose-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-['Playfair_Display'] font-medium text-emerald-900">
                  Password
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    className="h-11 border-emerald-100 bg-white/90 font-['Playfair_Display'] focus:border-emerald-500 focus:ring-emerald-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-rose-500" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-6 h-12 w-full rounded-3xl border-0 bg-gradient-to-br from-green-500 to-emerald-600 font-['Playfair_Display'] font-bold text-white shadow-[0px_8px_16px_0px_rgba(34,197,94,0.25)] transition-all duration-300 hover:from-green-600 hover:to-emerald-700"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Form>

      <div className="space-y-3 pt-4 text-center">
        <button
          type="button"
          onClick={onForgotPassword}
          className="font-['Playfair_Display'] text-sm text-green-600 underline decoration-2 underline-offset-2 transition-colors hover:text-green-700"
        >
          Forgot your password?
        </button>

        <p className="font-['Playfair_Display'] text-sm text-emerald-900/80">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={onRegister}
            className="font-semibold text-green-600 underline decoration-2 underline-offset-2 transition-colors hover:text-green-700"
          >
            Sign up here
          </button>
        </p>
      </div>
    </div>
  );
}
