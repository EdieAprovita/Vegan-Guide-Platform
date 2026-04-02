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

/**
 * Typed extractor for list responses. Throws if the response shape is invalid
 * so callers get a clear error instead of silently receiving `undefined`.
 */
export function extractListData<T>(response: unknown): T[] {
  if (response && typeof response === "object" && "data" in response) {
    const data = (response as { data: unknown }).data;
    if (Array.isArray(data)) return data as T[];
  }
  if (Array.isArray(response)) return response as T[];
  throw new Error("Invalid list response shape: expected array in data field");
}

/**
 * Typed extractor for single-item responses. Throws if the response shape
 * is invalid.
 */
export function extractItemData<T>(response: unknown): T {
  if (response && typeof response === "object" && "data" in response) {
    const data = (response as { data: unknown }).data;
    if (data !== undefined && data !== null) {
      return data as T;
    }
    throw new Error("Invalid item response shape: data field is null or undefined");
  }
  throw new Error("Invalid item response shape: expected data field");
}

/**
 * Typed extractor for paginated responses. Returns both the data array and
 * pagination metadata.
 */
export function extractPaginatedData<T>(response: unknown): PaginatedResponse<T> {
  if (response && typeof response === "object" && "data" in response) {
    const r = response as Record<string, unknown>;
    if (!Array.isArray(r.data)) {
      throw new Error("Invalid paginated response shape: expected data to be an array");
    }
    return {
      data: r.data as T[],
      totalPages: typeof r.totalPages === "number" ? r.totalPages : 1,
      currentPage: typeof r.currentPage === "number" ? r.currentPage : 1,
      totalCount: typeof r.totalCount === "number" ? r.totalCount : 0,
      hasNextPage: typeof r.hasNextPage === "boolean" ? r.hasNextPage : false,
      hasPrevPage: typeof r.hasPrevPage === "boolean" ? r.hasPrevPage : false,
    };
  }
  throw new Error("Invalid paginated response shape: expected data and pagination fields");
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

export function isBuildTimeApiFallbackEnabled(): boolean {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.BUILD_ALLOW_API_FALLBACK === "1"
  );
}

export function shouldUseApiFallback(): boolean {
  return process.env.NODE_ENV === "development" || isBuildTimeApiFallbackEnabled();
}

export function isNonApiTransportError(error: unknown): boolean {
  if (error instanceof ApiError) return false;
  if (error && typeof error === "object" && "status" in error) return false;
  return true;
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

/**
 * Merges multiple AbortSignals into one. Aborts when any input signal aborts.
 * Uses native AbortSignal.any() when available (Node ≥20, Safari ≥17),
 * falls back to manual listener wiring for older environments.
 */
export function mergeAbortSignals(...signals: (AbortSignal | undefined | null)[]): AbortSignal {
  const defined = signals.filter((s): s is AbortSignal => s != null);
  if (defined.length === 0) return new AbortController().signal;
  if (defined.length === 1) return defined[0];

  // Use native AbortSignal.any() when available.
  // The spec signature is AbortSignal.any(iterable) — pass the array directly.
  if (
    typeof AbortSignal !== "undefined" &&
    typeof (AbortSignal as unknown as { any?: unknown }).any === "function"
  ) {
    return (AbortSignal as unknown as { any: (signals: AbortSignal[]) => AbortSignal }).any(
      defined
    );
  }

  // Polyfill: manual listener wiring
  const controller = new AbortController();
  const abort = () => {
    controller.abort();
    defined.forEach((s) => s.removeEventListener("abort", abort));
  };
  defined.forEach((s) => {
    if (s.aborted) {
      abort();
    } else {
      s.addEventListener("abort", abort, { once: true });
    }
  });
  return controller.signal;
}

// Función helper para hacer requests con manejo de errores consistente
export const apiRequest = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const correlationId = generateCorrelationId();
  const method = (options.method ?? "GET").toUpperCase();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  // Merge the caller's signal (if provided) with the internal timeout signal so that
  // either an external abort (e.g. component unmounts) or the timeout cancels the fetch.
  const signals: AbortSignal[] = [controller.signal];
  if (options.signal instanceof AbortSignal) {
    signals.push(options.signal);
  }
  const mergedSignal = mergeAbortSignals(...signals);

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
      ...options,
      signal: mergedSignal,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
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
      // In CI and production build fallback mode we avoid noisy logs.
      if (!process.env.CI && !isBuildTimeApiFallbackEnabled()) {
        console.error(`[API Error] [${correlationId}] ${method} ${url}:`, errorMessage);
      }
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
      // If the caller's signal was aborted, re-throw the native AbortError so the
      // caller can distinguish an intentional cancellation from a timeout.
      if (options.signal?.aborted) {
        throw error;
      }
      // In CI and production build fallback mode we avoid noisy logs.
      if (!process.env.CI && !isBuildTimeApiFallbackEnabled()) {
        console.error(`[API Error] [${correlationId}] ${method} ${url}:`, "Request timeout");
      }
      throw new Error("Request timeout");
    }
    if (!(error instanceof ApiError)) {
      // In CI and production build fallback mode we avoid noisy logs.
      if (!process.env.CI && !isBuildTimeApiFallbackEnabled()) {
        console.error(`[API Error] [${correlationId}] ${method} ${url}:`, error);
      }
    }
    throw error;
  }
};
