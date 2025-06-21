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
  FormMessage, } from "@/components/ui/form";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
  onLogin: () => void;
  isLoading: boolean;
}

export function RegisterForm({
  onSubmit,
  onLogin,
  isLoading,
}: RegisterFormProps) {
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
    },
  });

  const handleSubmit = async (data: RegisterFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-6 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold font-['Playfair_Display'] text-green-800 tracking-tight">
          Join Verde Guide
        </h1>
        <p className="text-emerald-800/80 font-['Playfair_Display'] text-lg">
          Start your plant-based journey today
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-['Playfair_Display'] text-emerald-900 font-medium">
                  Username
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter your username"
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
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-['Playfair_Display'] text-emerald-900 font-medium">
                  Account Type
                </FormLabel>
                <FormControl>
                  <select
                    value={field.value}
                    onChange={field.onChange}
                    className="w-full font-['Playfair_Display'] bg-white rounded-md border border-input px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">Select your account type</option>
                    <option value="user">Regular User</option>
                    <option value="professional">Professional</option>
                  </select>
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
                    placeholder="Create a strong password"
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
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-['Playfair_Display'] text-emerald-900 font-medium">
                  Confirm Password
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirm your password"
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
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      </Form>

      <div className="text-center pt-4">
        <p className="text-emerald-900/80 font-['Playfair_Display'] text-sm">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onLogin}
            className="text-green-600 hover:text-green-700 font-semibold underline decoration-2 underline-offset-2 transition-colors inline-flex items-center gap-1">
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
}
