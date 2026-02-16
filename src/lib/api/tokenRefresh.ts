import { API_CONFIG, apiRequest, getApiHeaders } from "./config";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface RefreshResponse {
  success: boolean;
  data: TokenPair;
}

let refreshPromise: Promise<TokenPair> | null = null;

export async function refreshAccessToken(currentRefreshToken: string): Promise<TokenPair> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await apiRequest<RefreshResponse>("/auth/refresh-token", {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      });

      return response.data;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiRequestWithRefresh<T>(
  url: string,
  options: RequestInit,
  token: string,
  refreshToken: string,
  onTokenRefreshed?: (tokens: TokenPair) => void
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
      ...options,
      signal: controller.signal,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (response.status === 401 && refreshToken) {
      const newTokens = await refreshAccessToken(refreshToken);
      onTokenRefreshed?.(newTokens);

      // Create new abort controller for retry with fresh timeout
      const retryController = new AbortController();
      const retryTimeoutId = setTimeout(() => retryController.abort(), API_CONFIG.TIMEOUT);

      try {
        const retryResponse = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
          ...options,
          signal: retryController.signal,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${newTokens.accessToken}`,
            ...options.headers,
          },
        });

        clearTimeout(retryTimeoutId);

        if (!retryResponse.ok) {
          const errorData = await retryResponse.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP ${retryResponse.status}: ${retryResponse.statusText}`
          );
        }

        return retryResponse.json();
      } catch (retryError) {
        clearTimeout(retryTimeoutId);
        if (retryError instanceof Error && retryError.name === "AbortError") {
          throw new Error("Retry request timeout");
        }
        throw retryError;
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout");
    }
    throw error;
  }
}
