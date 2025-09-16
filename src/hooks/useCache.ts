import { useState, useEffect, useCallback } from "react";

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheOptions {
  ttl?: number; // Default TTL in milliseconds (5 minutes)
  key?: string; // Custom cache key
}

export function useCache<T>(
  fetchFunction: () => Promise<T>,
  dependencies: unknown[] = [],
  options: CacheOptions = {}
) {
  const { ttl = 5 * 60 * 1000, key } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const cacheKey = key || JSON.stringify(dependencies);

  const getCachedData = useCallback((): T | null => {
    try {
      const cached = localStorage.getItem(`cache_${cacheKey}`);
      if (cached) {
        const item: CacheItem<T> = JSON.parse(cached);
        const now = Date.now();

        if (now - item.timestamp < item.ttl) {
          return item.data;
        } else {
          // Remove expired cache
          localStorage.removeItem(`cache_${cacheKey}`);
        }
      }
    } catch (error) {
      console.warn("Failed to read from cache:", error);
    }
    return null;
  }, [cacheKey]);

  const setCachedData = useCallback(
    (data: T) => {
      try {
        const cacheItem: CacheItem<T> = {
          data,
          timestamp: Date.now(),
          ttl,
        };
        localStorage.setItem(`cache_${cacheKey}`, JSON.stringify(cacheItem));
      } catch (error) {
        console.warn("Failed to write to cache:", error);
      }
    },
    [cacheKey, ttl]
  );

  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(`cache_${cacheKey}`);
    } catch (error) {
      console.warn("Failed to clear cache:", error);
    }
  }, [cacheKey]);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction();
      setData(result);
      setCachedData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, setCachedData]);

  useEffect(() => {
    // Try to get cached data first
    const cachedData = getCachedData();
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
    } else {
      // Fetch fresh data if no cache
      refetch();
    }
  }, [getCachedData, refetch]);

  return {
    data,
    loading,
    error,
    refetch,
    clearCache,
  };
}

// Utility function to clear all cache
export function clearAllCache() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("cache_")) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn("Failed to clear all cache:", error);
  }
}

// Utility function to get cache size
export function getCacheSize(): number {
  try {
    const keys = Object.keys(localStorage);
    return keys.filter((key) => key.startsWith("cache_")).length;
  } catch (error) {
    console.warn("Failed to get cache size:", error);
    return 0;
  }
}
