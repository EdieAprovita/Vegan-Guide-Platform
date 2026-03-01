import { renderHook, act, waitFor } from "@testing-library/react";
import { useCache, clearAllCache, getCacheSize } from "@/hooks/useCache";

// localStorage is available in jsdom; we reset it between tests
const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

afterAll(() => {
  consoleWarnSpy.mockRestore();
});

describe("useCache", () => {
  it("fetches fresh data when no cache exists and stores the result", async () => {
    const fetchFn = jest.fn().mockResolvedValue({ name: "vegan" });

    const { result } = renderHook(() =>
      useCache(fetchFn, [], { key: "test-fresh" })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual({ name: "vegan" });
    expect(result.current.error).toBeNull();

    // Verify it was written to localStorage
    const stored = localStorage.getItem("cache_test-fresh");
    expect(stored).not.toBeNull();
  });

  it("returns cached data when the cache is still valid", async () => {
    const cachedData = { name: "cached" };
    const cacheItem = {
      data: cachedData,
      timestamp: Date.now(),
      ttl: 5 * 60 * 1000, // 5 minutes
    };
    localStorage.setItem("cache_test-cached", JSON.stringify(cacheItem));

    const fetchFn = jest.fn().mockResolvedValue({ name: "fresh" });

    const { result } = renderHook(() =>
      useCache(fetchFn, [], { key: "test-cached" })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Should NOT call the fetch function since cache is valid
    expect(fetchFn).not.toHaveBeenCalled();
    expect(result.current.data).toEqual(cachedData);
  });

  it("fetches fresh data when cache is expired", async () => {
    const staleItem = {
      data: { name: "stale" },
      timestamp: Date.now() - 10 * 60 * 1000, // 10 minutes ago
      ttl: 5 * 60 * 1000, // 5-minute TTL, so this is expired
    };
    localStorage.setItem("cache_test-expired", JSON.stringify(staleItem));

    const fetchFn = jest.fn().mockResolvedValue({ name: "fresh" });

    const { result } = renderHook(() =>
      useCache(fetchFn, [], { key: "test-expired" })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual({ name: "fresh" });
    // After fetching fresh data, it is written back under the same key
    const stored = localStorage.getItem("cache_test-expired");
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!).data).toEqual({ name: "fresh" });
  });

  it("removes expired item and stores new cache after fetch", async () => {
    const staleItem = {
      data: { name: "stale" },
      timestamp: Date.now() - 10 * 60 * 1000,
      ttl: 5 * 60 * 1000,
    };
    localStorage.setItem("cache_test-refresh", JSON.stringify(staleItem));

    const fetchFn = jest.fn().mockResolvedValue({ name: "refreshed" });

    const { result } = renderHook(() =>
      useCache(fetchFn, [], { key: "test-refresh" })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    const newItem = JSON.parse(localStorage.getItem("cache_test-refresh")!);
    expect(newItem.data).toEqual({ name: "refreshed" });
    expect(newItem.ttl).toBe(5 * 60 * 1000);
  });

  it("sets error state when fetchFunction rejects", async () => {
    const fetchFn = jest.fn().mockRejectedValue(new Error("fetch failed"));

    const { result } = renderHook(() =>
      useCache(fetchFn, [], { key: "test-error" })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("fetch failed");
    expect(result.current.data).toBeNull();
  });

  it("refetch bypasses cache and fetches fresh data", async () => {
    const cachedData = { name: "cached" };
    const cacheItem = {
      data: cachedData,
      timestamp: Date.now(),
      ttl: 5 * 60 * 1000,
    };
    localStorage.setItem("cache_test-refetch", JSON.stringify(cacheItem));

    const freshData = { name: "fresh" };
    const fetchFn = jest.fn().mockResolvedValue(freshData);

    const { result } = renderHook(() =>
      useCache(fetchFn, [], { key: "test-refetch" })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Initially uses cached data without calling fetchFn
    expect(fetchFn).not.toHaveBeenCalled();
    expect(result.current.data).toEqual(cachedData);

    await act(async () => {
      await result.current.refetch();
    });

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(freshData);
  });

  it("clearCache removes the specific cache entry", async () => {
    const cacheItem = {
      data: { name: "to-be-cleared" },
      timestamp: Date.now(),
      ttl: 5 * 60 * 1000,
    };
    localStorage.setItem("cache_test-clear", JSON.stringify(cacheItem));

    const fetchFn = jest.fn().mockResolvedValue({ name: "after-clear" });

    const { result } = renderHook(() =>
      useCache(fetchFn, [], { key: "test-clear" })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.clearCache();
    });

    expect(localStorage.getItem("cache_test-clear")).toBeNull();
  });

  it("uses JSON.stringify of dependencies as cache key when no key is provided", async () => {
    const fetchFn = jest.fn().mockResolvedValue([1, 2, 3]);

    const { result } = renderHook(() => useCache(fetchFn, ["dep1", 42]));

    await waitFor(() => expect(result.current.loading).toBe(false));

    // The key should be the JSON-stringified dependencies
    const expectedKey = `cache_${JSON.stringify(["dep1", 42])}`;
    expect(localStorage.getItem(expectedKey)).not.toBeNull();
  });

  it("respects a custom ttl option", async () => {
    const fetchFn = jest.fn().mockResolvedValue("data");
    const customTtl = 1000; // 1 second

    const { result } = renderHook(() =>
      useCache(fetchFn, [], { key: "test-ttl", ttl: customTtl })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    const stored = JSON.parse(localStorage.getItem("cache_test-ttl")!);
    expect(stored.ttl).toBe(customTtl);
  });

  it("handles corrupted cache entry gracefully and fetches fresh", async () => {
    localStorage.setItem("cache_test-corrupt", "not-valid-json{");

    const fetchFn = jest.fn().mockResolvedValue({ name: "recovered" });

    const { result } = renderHook(() =>
      useCache(fetchFn, [], { key: "test-corrupt" })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Should fall back to fetch when cache is unreadable
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual({ name: "recovered" });
  });
});

describe("clearAllCache", () => {
  it("removes all entries that start with cache_ prefix", () => {
    localStorage.setItem("cache_a", "{}");
    localStorage.setItem("cache_b", "{}");
    localStorage.setItem("other_key", "kept");

    clearAllCache();

    expect(localStorage.getItem("cache_a")).toBeNull();
    expect(localStorage.getItem("cache_b")).toBeNull();
    expect(localStorage.getItem("other_key")).toBe("kept");
  });

  it("does not throw when localStorage is empty", () => {
    expect(() => clearAllCache()).not.toThrow();
  });
});

describe("getCacheSize", () => {
  it("returns the number of cache_ entries", () => {
    localStorage.setItem("cache_x", "{}");
    localStorage.setItem("cache_y", "{}");
    localStorage.setItem("unrelated", "{}");

    expect(getCacheSize()).toBe(2);
  });

  it("returns 0 when there are no cache entries", () => {
    expect(getCacheSize()).toBe(0);
  });
});
