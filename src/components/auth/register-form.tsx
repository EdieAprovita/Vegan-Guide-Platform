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
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
  onLogin: () => void;
  isLoading: boolean;
}

export function RegisterForm({ onSubmit, onLogin, isLoading }: RegisterFormProps) {
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
    <div className="mx-auto w-full max-w-sm space-y-6 rounded-2xl bg-white/80 p-8 shadow-lg backdrop-blur-sm">
      <div className="space-y-3 text-center">
        <h1 className="font-['Playfair_Display'] text-3xl font-bold tracking-tight text-green-800">
          Join Verde Guide
        </h1>
        <p className="font-['Playfair_Display'] text-lg text-emerald-800/80">
          Start your plant-based journey today
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5" noValidate>
          <FormField
            control={form.control}
            name="username"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel className="font-['Playfair_Display'] font-medium text-emerald-900">
                  Username{" "}
                  <span aria-label="required" className="text-rose-500">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    id="register-username"
                    type="text"
                    placeholder="Enter your username"
                    className="h-11 border-emerald-100 bg-white/90 font-['Playfair_Display'] focus:border-emerald-500 focus:ring-emerald-500"
                    aria-required="true"
                    aria-invalid={!!error}
                    aria-describedby={error ? "register-username-error" : undefined}
                    {...field}
                  />
                </FormControl>
                <FormMessage id="register-username-error" className="text-rose-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel className="font-['Playfair_Display'] font-medium text-emerald-900">
                  Email{" "}
                  <span aria-label="required" className="text-rose-500">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="Enter your email"
                    className="h-11 border-emerald-100 bg-white/90 font-['Playfair_Display'] focus:border-emerald-500 focus:ring-emerald-500"
                    aria-required="true"
                    aria-invalid={!!error}
                    aria-describedby={error ? "register-email-error" : undefined}
                    {...field}
                  />
                </FormControl>
                <FormMessage id="register-email-error" className="text-rose-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel
                  htmlFor="register-role"
                  className="font-['Playfair_Display'] font-medium text-emerald-900"
                >
                  Account Type{" "}
                  <span aria-label="required" className="text-rose-500">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <select
                    id="register-role"
                    value={field.value}
                    onChange={field.onChange}
                    aria-required="true"
                    aria-invalid={!!error}
                    aria-describedby={error ? "register-role-error" : undefined}
                    className="border-input focus:ring-ring w-full rounded-md border bg-white px-3 py-2 font-['Playfair_Display'] text-sm shadow-sm focus:ring-1 focus:outline-none"
                  >
                    <option value="">Select your account type</option>
                    <option value="user">Regular User</option>
                    <option value="professional">Professional</option>
                  </select>
                </FormControl>
                <FormMessage id="register-role-error" className="text-rose-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel className="font-['Playfair_Display'] font-medium text-emerald-900">
                  Password{" "}
                  <span aria-label="required" className="text-rose-500">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Create a strong password"
                    className="h-11 border-emerald-100 bg-white/90 font-['Playfair_Display'] focus:border-emerald-500 focus:ring-emerald-500"
                    aria-required="true"
                    aria-invalid={!!error}
                    aria-describedby={error ? "register-password-error" : undefined}
                    {...field}
                  />
                </FormControl>
                <FormMessage id="register-password-error" className="text-rose-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel className="font-['Playfair_Display'] font-medium text-emerald-900">
                  Confirm Password{" "}
                  <span aria-label="required" className="text-rose-500">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    id="register-confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    className="h-11 border-emerald-100 bg-white/90 font-['Playfair_Display'] focus:border-emerald-500 focus:ring-emerald-500"
                    aria-required="true"
                    aria-invalid={!!error}
                    aria-describedby={error ? "register-confirm-password-error" : undefined}
                    {...field}
                  />
                </FormControl>
                <FormMessage id="register-confirm-password-error" className="text-rose-500" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-6 h-12 w-full rounded-3xl border-0 bg-gradient-to-br from-green-500 to-emerald-600 font-['Playfair_Display'] font-bold text-white shadow-[0px_8px_16px_0px_rgba(34,197,94,0.25)] transition-all duration-300 hover:from-green-600 hover:to-emerald-700"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      </Form>

      <div className="pt-4 text-center">
        <p className="font-['Playfair_Display'] text-sm text-emerald-900/80">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onLogin}
            className="inline-flex items-center gap-1 font-semibold text-green-600 underline decoration-2 underline-offset-2 transition-colors hover:text-green-700"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
}
