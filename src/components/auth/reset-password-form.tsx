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
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations/auth";

interface ResetPasswordFormProps {
  onSubmit: (data: ResetPasswordFormData) => Promise<void>;
  onBackToLogin: () => void;
  isLoading: boolean;
}

export function ResetPasswordForm({ onSubmit, onBackToLogin, isLoading }: ResetPasswordFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (data: ResetPasswordFormData) => {
    try {
      await onSubmit(data);
      setIsSuccess(true);
    } catch (error) {
      console.error("Reset password failed:", error);
    }
  };

  if (isSuccess) {
    return (
      <div className="mx-auto w-full max-w-sm space-y-6 text-center">
        <div className="space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="font-['Playfair_Display'] text-2xl font-bold text-green-800">
            Check Your Email
          </h1>
          <p className="font-['Playfair_Display'] text-gray-600">
            We&apos;ve sent a password reset link to your email address.
          </p>
        </div>

        <Button
          onClick={onBackToLogin}
          variant="outline"
          className="h-12 w-full rounded-3xl border-green-500 font-['Playfair_Display'] text-green-600 hover:bg-green-50"
        >
          Back to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="font-['Playfair_Display'] text-2xl font-bold text-green-800">
          Reset Password
        </h1>
        <p className="font-['Playfair_Display'] text-gray-600">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 rounded-lg bg-white p-6 shadow-sm"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-['Playfair_Display']">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="bg-white font-['Playfair_Display']"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 w-full rounded-3xl border-0 bg-green-500 font-['Playfair_Display'] font-bold text-white shadow-[0px_6px_12px_0px_rgba(34,197,94,0.22)] hover:bg-green-600"
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </Form>

      <div className="text-center">
        <button
          type="button"
          onClick={onBackToLogin}
          className="font-['Playfair_Display'] text-sm text-green-600 underline hover:text-green-700"
        >
          Back to Sign In
        </button>
      </div>
    </div>
  );
}
