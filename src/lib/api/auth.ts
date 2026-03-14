import {
  LoginFormData,
  NewPasswordFormData,
  RegisterFormData,
  ResetPasswordFormData,
} from "@/lib/validations/auth";
import { User } from "@/types";
import { apiRequest, getApiHeaders } from "./config";

export async function login(data: LoginFormData): Promise<User> {
  return apiRequest<User>("/users/login", {
    method: "POST",
    headers: getApiHeaders(),
    body: JSON.stringify(data),
  });
}

export async function register(data: RegisterFormData): Promise<User> {
  return apiRequest<User>("/users/register", {
    method: "POST",
    headers: getApiHeaders(),
    body: JSON.stringify(data),
  });
}

export async function logout(token?: string) {
  // Blacklist the current token via the auth endpoint
  if (token) {
    await apiRequest<void>("/auth/logout", {
      method: "POST",
      headers: getApiHeaders(token),
    }).catch(() => {
      // Non-blocking: proceed with logout even if blacklist fails
    });
  }

  return apiRequest<void>("/users/logout", {
    method: "POST",
    headers: getApiHeaders(),
  });
}

export async function revokeAllSessions(token: string) {
  return apiRequest<void>("/auth/revoke-all-tokens", {
    method: "POST",
    headers: getApiHeaders(token),
  });
}

export async function getProfile(token: string): Promise<User> {
  if (!token) {
    throw new Error("Not authenticated");
  }

  return apiRequest<User>("/users/profile", {
    headers: getApiHeaders(token),
  });
}

export async function forgotPassword(data: ResetPasswordFormData): Promise<void> {
  return apiRequest<void>("/users/forgot-password", {
    method: "POST",
    headers: getApiHeaders(),
    body: JSON.stringify(data),
  });
}

export async function resetPassword(data: NewPasswordFormData, token: string): Promise<void> {
  return apiRequest<void>("/users/reset-password", {
    method: "PUT",
    headers: getApiHeaders(),
    body: JSON.stringify({ ...data, token }),
  });
}

export async function getUserProfile(token: string): Promise<User> {
  return getProfile(token);
}

export async function updateUserProfile(
  data: Partial<RegisterFormData>,
  token: string
): Promise<User> {
  if (!token) {
    throw new Error("Not authenticated");
  }

  return apiRequest<User>("/users/profile", {
    method: "PUT",
    headers: getApiHeaders(token),
    body: JSON.stringify(data),
  });
}
