// Configuración centralizada de la API
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001/api/v1",
  TIMEOUT: 15000, // Aumentar timeout a 15 segundos
  RETRY_ATTEMPTS: 3,
} as const;

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
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: T[] | T }).data;
  }
  if (Array.isArray(response)) {
    return response as T[];
  }
  return response as T;
}

// Tipos para manejo de errores
interface ApiErrorResponse {
  message?: string;
  error?: string;
  details?: string;
}

interface ApiErrorLegacy extends Error {
  response?: {
    data?: ApiErrorResponse;
    status?: number;
  };
}

/**
 * Error tipado que expone el status HTTP devuelto por el backend.
 * Reemplaza el `throw new Error(message)` genérico en apiRequest para que
 * los callers puedan distinguir entre un 404/501 (endpoint no implementado)
 * y cualquier otro error real del servidor.
 */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Generates a short unique ID for distributed request tracing.
// Generates a unique correlation ID using crypto.randomUUID() (available in
// all modern browsers and Node 14.17+). Falls back to crypto.getRandomValues()
// which is cryptographically secure and avoids Math.random() PRNG concerns.
export function generateCorrelationId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  // Last resort: timestamp-based (no PRNG, monotonic only)
  return `${Date.now().toString(36)}-${performance.now().toString(36).replace(".", "")}`;
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
    const apiError = error as ApiErrorLegacy;
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
  const correlationId = generateCorrelationId();
  const method = (options.method ?? "GET").toUpperCase();
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
        "X-Correlation-ID": correlationId,
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
      console.error(`[API Error] [${correlationId}] ${method} ${url}:`, errorMessage);
      throw new ApiError(response.status, errorMessage);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }

    return response.text() as unknown as T;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      console.error(`[API Error] [${correlationId}] ${method} ${url}:`, "Request timeout");
      throw new Error("Request timeout");
    }
    if (!(error instanceof ApiError)) {
      console.error(`[API Error] [${correlationId}] ${method} ${url}:`, error);
    }
    throw error;
  }
};
