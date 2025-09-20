// Configuración centralizada de la API
console.log('🔧 DEBUG: process.env.NEXT_PUBLIC_API_URL =', process.env.NEXT_PUBLIC_API_URL);
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001/api/v1",
  TIMEOUT: 15000, // Aumentar timeout a 15 segundos
  RETRY_ATTEMPTS: 3,
} as const;
console.log('🔧 DEBUG: API_CONFIG.BASE_URL =', API_CONFIG.BASE_URL);

// Tipos para respuestas paginadas (para mantener compatibilidad)
export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Tipo para las respuestas estándar del backend
export interface BackendResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// Tipo para respuestas de listas del backend
export type BackendListResponse<T> = BackendResponse<T[]>;

// Helper para extraer datos de respuestas del backend
export function extractBackendData<T>(response: BackendResponse<T>): T {
  return response.data;
}

// Helper para extraer arrays de respuestas del backend
export function extractBackendListData<T>(response: BackendListResponse<T>): T[] {
  return response.data;
}

// Helper universal para procesar respuestas del backend (maneja ambos formatos)
export function processBackendResponse<T>(response: unknown): T[] | T {
  // Si es el formato {success: true, data: ...}
  if (response && typeof response === "object" && "success" in response && "data" in response) {
    return (response as { success: boolean; data: T[] | T }).data;
  }
  // Si es el formato de recetas parcial {success: true, data: ...} sin message
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    Array.isArray((response as { data: unknown }).data)
  ) {
    return (response as { data: T[] }).data;
  }
  // Si es formato directo (para compatibilidad)
  if (Array.isArray(response)) {
    return response as T[];
  }
  // Si es objeto directo
  return response as T;
}

// Tipos para manejo de errores
interface ApiErrorResponse {
  message?: string;
  error?: string;
  details?: string;
}

interface ApiError extends Error {
  response?: {
    data?: ApiErrorResponse;
    status?: number;
  };
}

// Headers comunes para las requests
export const getApiHeaders = (token?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

// Interceptor para manejar errores de API de forma consistente
export const handleApiError = (error: unknown): string => {
  // Verificar si es un error de API con response
  if (error && typeof error === "object" && "response" in error) {
    const apiError = error as ApiError;
    if (apiError.response?.data?.message) {
      return apiError.response.data.message;
    }
  }

  // Verificar si es un Error estándar
  if (error instanceof Error) {
    return error.message;
  }

  // Verificar si es un string
  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred";
};

// Función helper para hacer requests con manejo de errores consistente
export const apiRequest = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
      ...options,
      signal: controller.signal,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData: ApiErrorResponse = {};
      try {
        errorData = await response.json();
      } catch {
        // Si no se puede parsear como JSON, usar respuesta vacía
        errorData = {};
      }

      const errorMessage =
        errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }

    return response.text() as unknown as T;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout");
    }
    throw error;
  }
};
