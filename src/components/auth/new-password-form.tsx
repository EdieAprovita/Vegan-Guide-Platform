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
import { newPasswordSchema, type NewPasswordFormData } from "@/lib/validations/auth";

interface NewPasswordFormProps {
  onSubmit?: (data: NewPasswordFormData) => Promise<void> | void;
}

export function NewPasswordForm({ onSubmit }: NewPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (data: NewPasswordFormData) => {
    setIsLoading(true);
    try {
      await onSubmit?.(data);
      setIsSuccess(true);
    } catch (error) {
      console.error("Password reset failed:", error);
    } finally {
      setIsLoading(false);
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
            Password Updated
          </h1>
          <p className="font-['Playfair_Display'] text-gray-600">
            Your password has been successfully updated. You can now sign in with your new password.
          </p>
        </div>

        <Button
          onClick={() => (window.location.href = "/login")}
          className="h-12 w-full rounded-3xl border-0 bg-green-500 font-['Playfair_Display'] font-bold text-white shadow-[0px_6px_12px_0px_rgba(34,197,94,0.22)] hover:bg-green-600"
        >
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="font-['Playfair_Display'] text-2xl font-bold text-green-800">
          Set New Password
        </h1>
        <p className="font-['Playfair_Display'] text-gray-600">
          Enter a new password for your Verde Guide account.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-['Playfair_Display']">New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your new password"
                    className="font-['Playfair_Display']"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-['Playfair_Display']">Confirm New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirm your new password"
                    className="font-['Playfair_Display']"
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
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
