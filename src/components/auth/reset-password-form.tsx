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
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/lib/validations/auth";

interface ResetPasswordFormProps {
  onSubmit?: (data: ResetPasswordFormData) => Promise<void> | void;
  onBackToLogin?: () => void;
}

export function ResetPasswordForm({
  onSubmit,
  onBackToLogin,
}: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      await onSubmit?.(data);
      setIsSuccess(true);
    } catch (error) {
      console.error("Reset password failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-sm mx-auto space-y-6 text-center">
        <div className="space-y-2">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold font-['Playfair_Display'] text-green-800">
            Check Your Email
          </h1>
          <p className="text-gray-600 font-['Playfair_Display']">
            We've sent a password reset link to your email address.
          </p>
        </div>

        <Button
          onClick={onBackToLogin}
          variant="outline"
          className="w-full font-['Playfair_Display'] h-12 rounded-3xl border-green-500 text-green-600 hover:bg-green-50">
          Back to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold font-['Playfair_Display'] text-green-800">
          Reset Password
        </h1>
        <p className="text-gray-600 font-['Playfair_Display']">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-['Playfair_Display']">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="font-['Playfair_Display'] bg-white"
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
            className="w-full bg-green-500 hover:bg-green-600 text-white font-['Playfair_Display'] font-bold h-12 rounded-3xl shadow-[0px_6px_12px_0px_rgba(34,197,94,0.22)] border-0">
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </Form>

      <div className="text-center">
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-green-600 hover:text-green-700 font-['Playfair_Display'] text-sm underline">
          Back to Sign In
        </button>
      </div>
    </div>
  );
}
