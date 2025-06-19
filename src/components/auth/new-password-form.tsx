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
  newPasswordSchema,
  type NewPasswordFormData,
} from "@/lib/validations/auth";

interface NewPasswordFormProps {
  onSubmit?: (data: NewPasswordFormData) => Promise<void> | void;
  token?: string;
}

export function NewPasswordForm({ onSubmit, token }: NewPasswordFormProps) {
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
      <div className="w-full max-w-sm mx-auto space-y-6 text-center">
        <div className="space-y-2">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
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
          <h1 className="text-2xl font-bold font-['Playfair_Display'] text-green-800">
            Password Updated
          </h1>
          <p className="text-gray-600 font-['Playfair_Display']">
            Your password has been successfully updated. You can now sign in
            with your new password.
          </p>
        </div>

        <Button
          onClick={() => (window.location.href = "/login")}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-['Playfair_Display'] font-bold h-12 rounded-3xl shadow-[0px_6px_12px_0px_rgba(34,197,94,0.22)] border-0"
        >
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold font-['Playfair_Display'] text-green-800">
          Set New Password
        </h1>
        <p className="text-gray-600 font-['Playfair_Display']">
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
                <FormLabel className="font-['Playfair_Display']">
                  New Password
                </FormLabel>
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
                <FormLabel className="font-['Playfair_Display']">
                  Confirm New Password
                </FormLabel>
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
            className="w-full bg-green-500 hover:bg-green-600 text-white font-['Playfair_Display'] font-bold h-12 rounded-3xl shadow-[0px_6px_12px_0px_rgba(34,197,94,0.22)] border-0"
          >
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
