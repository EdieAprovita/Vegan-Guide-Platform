import {
  LoginFormData,
  NewPasswordFormData,
  RegisterFormData,
  ResetPasswordFormData,
} from "@/lib/validations/auth";
import { User } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function login(data: LoginFormData): Promise<User> {
  const response = await fetch(`${API_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to login");
  }

  return response.json();
}

export async function register(data: RegisterFormData): Promise<User> {
  const response = await fetch(`${API_URL}/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to register");
  }

  return response.json();
}

export async function logout() {
  await fetch(`${API_URL}/users/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function getProfile(token: string): Promise<User> {
  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_URL}/users/profile`, {
    headers: {
      "Content-Type": "application/json",
      Cookie: `jwt=${token}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Not authenticated");
  }

  return response.json();
}

export async function forgotPassword(data: ResetPasswordFormData): Promise<void> {
  const response = await fetch(`${API_URL}/users/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to send reset password email");
  }
}

export async function resetPassword(
  data: NewPasswordFormData,
  token: string
): Promise<void> {
  const response = await fetch(`${API_URL}/users/reset-password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, token }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to reset password");
  }
}

export async function getUserProfile(userId: string, token: string) {
  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_URL}/users/${userId}`, {
    headers: {
      "Content-Type": "application/json",
      Cookie: `jwt=${token}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to get user profile");
  }

  return response.json();
}

export async function updateUserProfile(
  data: Partial<RegisterFormData>,
  token: string
): Promise<User> {
  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_URL}/users/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: `jwt=${token}`,
    },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update profile");
  }
  return response.json();
}
