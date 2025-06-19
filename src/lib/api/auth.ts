import axios from "axios";
import type {
  LoginFormData,
  RegisterFormData,
  ResetPasswordFormData,
  NewPasswordFormData,
} from "@/lib/validations/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Para manejar cookies JWT
});

export interface AuthResponse {
  _id: string;
  username: string;
  email: string;
  role: "user" | "professional";
  photo: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const authApi = {
  async login(credentials: LoginFormData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/users/login", credentials);
    return response.data;
  },

  async register(userData: RegisterFormData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/users/register", {
      username: userData.name,
      email: userData.email,
      password: userData.password,
    });
    return response.data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      "/users/forgot-password",
      { email }
    );
    return response.data;
  },

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>(
      "/users/reset-password",
      {
        token,
        newPassword,
      }
    );
    return response.data;
  },

  async logout(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>("/users/logout");
    return response.data;
  },

  async getCurrentUser(): Promise<AuthResponse> {
    const response = await api.get<AuthResponse>("/users/profile");
    return response.data;
  },
};

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "An error occurred";
    return Promise.reject(new Error(message));
  }
);
