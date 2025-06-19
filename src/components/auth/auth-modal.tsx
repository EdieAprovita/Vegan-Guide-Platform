"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";
import { ResetPasswordForm } from "./reset-password-form";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import type {
  LoginFormData,
  RegisterFormData,
  ResetPasswordFormData,
} from "@/lib/validations/auth";

type AuthView = "login" | "register" | "reset-password";

interface AuthModalProps {
  trigger?: React.ReactNode;
  defaultView?: AuthView;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AuthModal({
  trigger,
  defaultView = "login",
  open,
  onOpenChange,
}: AuthModalProps) {
  const [currentView, setCurrentView] = useState<AuthView>(defaultView);
  const [isOpen, setIsOpen] = useState(open ?? false);
  const {
    login,
    register,
    forgotPassword,
    isLoggingIn,
    isRegistering,
    isSendingResetEmail,
  } = useAuth();

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
    if (!newOpen) {
      // Reset to default view when modal closes
      setTimeout(() => setCurrentView(defaultView), 200);
    }
  };

  const handleLogin = async (data: LoginFormData) => {
    try {
      await login(data);
      handleOpenChange(false);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    try {
      await register(data);
      handleOpenChange(false);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    try {
      await forgotPassword({ email: data.email });
      // Don't close modal, let user see success message
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const getDialogContent = () => {
    switch (currentView) {
      case "login":
        return (
          <LoginForm
            onSubmit={handleLogin}
            onForgotPassword={() => setCurrentView("reset-password")}
            onRegister={() => setCurrentView("register")}
            isLoading={isLoggingIn}
          />
        );
      case "register":
        return (
          <RegisterForm
            onSubmit={handleRegister}
            onLogin={() => setCurrentView("login")}
            isLoading={isRegistering}
          />
        );
      case "reset-password":
        return (
          <ResetPasswordForm
            onSubmit={handleResetPassword}
            onBackToLogin={() => setCurrentView("login")}
            isLoading={isSendingResetEmail}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="sm:max-w-md border-green-200 bg-green-50/50 backdrop-blur-sm">
        <DialogHeader className="sr-only">
          <DialogTitle>Authentication</DialogTitle>
          <DialogDescription>
            Sign in or create an account to access Verde Guide
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">{getDialogContent()}</div>
      </DialogContent>
    </Dialog>
  );
}

// Convenience components for specific use cases
export function LoginModal(props: Omit<AuthModalProps, "defaultView">) {
  return <AuthModal {...props} defaultView="login" />;
}

export function RegisterModal(props: Omit<AuthModalProps, "defaultView">) {
  return <AuthModal {...props} defaultView="register" />;
}
