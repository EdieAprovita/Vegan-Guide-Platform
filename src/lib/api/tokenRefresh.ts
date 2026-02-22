import { API_CONFIG, apiRequest, getApiHeaders } from "./config";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface RefreshResponse {
  success: boolean;
  data: TokenPair;
}

const refreshPromises = new Map<string, Promise<TokenPair>>();

export async function refreshAccessToken(currentRefreshToken: string): Promise<TokenPair> {
  if (refreshPromises.has(currentRefreshToken)) {
    return refreshPromises.get(currentRefreshToken)!;
  }

  const promise = (async () => {
    try {
      const response = await apiRequest<RefreshResponse>("/auth/refresh-token", {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      });

      if (
        !response ||
        response.success !== true ||
        !response.data ||
        typeof response.data.accessToken !== "string" ||
        typeof response.data.refreshToken !== "string"
      ) {
        throw new Error("Failed to refresh access token: invalid refresh response from server.");
      }

      return response.data;
    } finally {
      refreshPromises.delete(currentRefreshToken);
    }
  })();

  refreshPromises.set(currentRefreshToken, promise);
  return promise;
}

interface RequestOptionsWithRetry extends RequestInit {
  _retry?: boolean;
}

/**
 * Helper to extract RequestInit from RequestOptionsWithRetry
 * Removes the _retry flag which is not part of standard RequestInit
 */
function toRequestInit(options: RequestOptionsWithRetry): RequestInit {
  // Destructure to safely remove _retry without type assertions
  const { _retry, ...requestInit } = options;
  return requestInit;
}

export async function apiRequestWithRefresh<T>(
  url: string,
  options: RequestOptionsWithRetry,
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

    // Only attempt refresh once to prevent infinite retry loops
    if (response.status === 401 && refreshToken && !options._retry) {
      const newTokens = await refreshAccessToken(refreshToken);
      onTokenRefreshed?.(newTokens);

      // Create new abort controller for retry with fresh timeout
      const retryController = new AbortController();
      const retryTimeoutId = setTimeout(() => retryController.abort(), API_CONFIG.TIMEOUT);

      try {
        const cleanedOptions = toRequestInit(options);

        const retryResponse = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
          ...cleanedOptions,
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
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
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
