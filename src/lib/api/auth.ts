import {
  LoginFormData,
  NewPasswordFormData,
  RegisterFormData,
  ResetPasswordFormData,
} from "@/lib/validations/auth";
import { User } from "@/types";
import {  apiRequest, getApiHeaders } from "./config";

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

export async function logout() {
  return apiRequest<void>("/users/logout", {
    method: "POST",
    headers: getApiHeaders(),
  });
}

export async function getProfile(token: string): Promise<User> {
  if (!token) {
    throw new Error("Not authenticated");
  }

  // Nota: Backend no tiene endpoint para perfil actual, usando getUserProfile genérico
  // Deberías agregar un endpoint /users/me en tu backend
  return apiRequest<User>("/users/me", {
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

export async function resetPassword(
  data: NewPasswordFormData,
  token: string
): Promise<void> {
  return apiRequest<void>("/users/reset-password", {
    method: "PUT",
    headers: getApiHeaders(),
    body: JSON.stringify({ ...data, token }),
  });
}

export async function getUserProfile(userId: string, token: string): Promise<User> {
  if (!token) {
    throw new Error("Not authenticated");
  }

  return apiRequest<User>(`/users/${userId}`, {
    headers: getApiHeaders(token),
  });
}

export async function updateUserProfile(
  data: Partial<RegisterFormData>,
  token: string,
  userId: string
): Promise<User> {
  if (!token) {
    throw new Error("Not authenticated");
  }

  return apiRequest<User>(`/users/profile/${userId}`, {
    method: "PUT",
    headers: getApiHeaders(token),
    body: JSON.stringify(data),
  });
}
