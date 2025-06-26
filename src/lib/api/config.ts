// Configuración centralizada de la API
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

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
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Interceptor para manejar errores de API de forma consistente
export const handleApiError = (error: unknown): string => {
  // Verificar si es un error de API con response
  if (error && typeof error === 'object' && 'response' in error) {
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
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
};

// Función helper para hacer requests con manejo de errores consistente
export const apiRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
      ...options,
      signal: controller.signal,
      credentials: 'include',
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
      
      const errorMessage = errorData.message || 
                          errorData.error || 
                          `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return response.text() as unknown as T;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};
