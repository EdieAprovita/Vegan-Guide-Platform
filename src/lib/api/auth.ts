import { LoginFormData, RegisterFormData } from "../validations/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function login(data: LoginFormData) {
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

export async function register(data: RegisterFormData) {
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
  const response = await fetch(`${API_URL}/users/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to logout");
  }

  return response.json();
}

export async function getProfile() {
  const response = await fetch(`${API_URL}/users/profile`, {
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to get profile");
  }

  return response.json();
}

// Nuevas funciones para completar autenticación
export async function forgotPassword(email: string) {
  const response = await fetch(`${API_URL}/users/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to send reset email");
  }

  return response.json();
}

export async function resetPassword(token: string, newPassword: string) {
  const response = await fetch(`${API_URL}/users/reset-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, newPassword }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to reset password");
  }

  return response.json();
}

export async function getUserProfile(userId: string) {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to get user profile");
  }

  return response.json();
}

export async function updateUserProfile(userId: string, data: {
  username?: string;
  email?: string;
  photo?: string;
}) {
  const response = await fetch(`${API_URL}/users/profile/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
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
