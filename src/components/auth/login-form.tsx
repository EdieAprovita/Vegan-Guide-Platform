"use client";

import { useState } from "react";
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
  onSubmit?: (data: LoginFormData) => Promise<void> | void;
  onForgotPassword?: () => void;
  onRegister?: () => void;
  isLoading?: boolean;
}

export function LoginForm({
  onSubmit,
  onForgotPassword,
  onRegister,
  isLoading = false,
}: LoginFormProps) {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: LoginFormData) => {
    try {
      await onSubmit?.(data);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-6 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold font-['Playfair_Display'] text-green-800 tracking-tight">
          Welcome Back
        </h1>
        <p className="text-emerald-800/80 font-['Playfair_Display'] text-lg">
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
                <FormLabel className="font-['Playfair_Display'] text-emerald-900 font-medium">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="font-['Playfair_Display'] h-11 bg-white/90 border-emerald-100 focus:border-emerald-500 focus:ring-emerald-500"
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
                <FormLabel className="font-['Playfair_Display'] text-emerald-900 font-medium">
                  Password
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    className="font-['Playfair_Display'] h-11 bg-white/90 border-emerald-100 focus:border-emerald-500 focus:ring-emerald-500"
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
            className="w-full bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-['Playfair_Display'] font-bold h-12 rounded-3xl shadow-[0px_8px_16px_0px_rgba(34,197,94,0.25)] border-0 transition-all duration-300 mt-6">
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Form>

      <div className="text-center space-y-3 pt-4">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-green-600 hover:text-green-700 font-['Playfair_Display'] text-sm underline decoration-2 underline-offset-2 transition-colors">
          Forgot your password?
        </button>

        <p className="text-emerald-900/80 font-['Playfair_Display'] text-sm">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onRegister}
            className="text-green-600 hover:text-green-700 font-semibold underline decoration-2 underline-offset-2 transition-colors">
            Sign up here
          </button>
        </p>
      </div>
    </div>
  );
}
