import {
  API_CONFIG,
  apiRequest,
  extractBackendData,
  extractBackendListData,
  getApiHeaders,
  handleApiError,
  mergeAbortSignals,
} from "@/lib/api/config";
import { queryKeys } from "@/lib/api/queryKeys";

const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
  if (originalFetch) {
    global.fetch = originalFetch;
  }
  jest.useRealTimers();
});

describe("apiRequest", () => {
  it("returns parsed json when response is ok", async () => {
    const data = { success: true };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: jest.fn().mockResolvedValue(data),
    });

    const result = await apiRequest("/test");

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_CONFIG.BASE_URL}/test`,
      expect.objectContaining({ credentials: "include" })
    );
    expect(result).toEqual(data);
  });

  it("falls back to text when response is not json", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: { get: () => "text/plain" },
      text: jest.fn().mockResolvedValue("hello"),
    });

    const result = await apiRequest("/plain");

    expect(result).toBe("hello");
  });

  it("throws an error with backend message when response is not ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      headers: { get: () => "application/json" },
      json: jest.fn().mockResolvedValue({ message: "Invalid data" }),
    });

    await expect(apiRequest("/fail")).rejects.toThrow("Invalid data");
  });

  it("aborts the request after timeout", async () => {
    jest.useFakeTimers();

    (global.fetch as jest.Mock).mockImplementation((_, options: RequestInit = {}) => {
      return new Promise((_, reject) => {
        options.signal?.addEventListener("abort", () => {
          const abortError = Object.assign(new Error("Aborted"), { name: "AbortError" });
          reject(abortError);
        });
      });
    });

    const promise = apiRequest("/timeout");

    jest.advanceTimersByTime(API_CONFIG.TIMEOUT);

    await expect(promise).rejects.toThrow("Request timeout");
  });
});

describe("extraction helpers", () => {
  it("extracts data from backend wrappers", () => {
    const entry = { success: true, data: { id: "x" } };
    const list = { success: true, data: [{ id: "1" }] };

    expect(extractBackendData(entry)).toEqual({ id: "x" });
    expect(extractBackendListData(list)).toEqual([{ id: "1" }]);
  });
});

describe("getApiHeaders", () => {
  it("returns default headers and includes auth token when provided", () => {
    expect(getApiHeaders()).toEqual({ "Content-Type": "application/json" });
    expect(getApiHeaders("token")).toEqual({
      "Content-Type": "application/json",
      Authorization: "Bearer token",
    });
  });
});

describe("handleApiError", () => {
  it("prioritizes backend error messages", () => {
    const error = {
      response: {
        data: { message: "Backend failure" },
      },
    };

    expect(handleApiError(error)).toBe("Backend failure");
  });

  it("handles native errors, strings and unknown values", () => {
    expect(handleApiError(new Error("native"))).toBe("native");
    expect(handleApiError("plain error")).toBe("plain error");
    expect(handleApiError(undefined)).toBe("An unexpected error occurred");
  });
});

describe("mergeAbortSignals", () => {
  it("returns an inert signal when called with no arguments", () => {
    const signal = mergeAbortSignals();
    expect(signal.aborted).toBe(false);
  });

  it("returns the same signal when only one is provided", () => {
    const controller = new AbortController();
    const result = mergeAbortSignals(controller.signal);
    expect(result).toBe(controller.signal);
  });

  it("aborts the merged signal when the first input signal aborts", () => {
    const a = new AbortController();
    const b = new AbortController();
    const merged = mergeAbortSignals(a.signal, b.signal);

    expect(merged.aborted).toBe(false);
    a.abort();
    expect(merged.aborted).toBe(true);
  });

  it("aborts the merged signal when the second input signal aborts", () => {
    const a = new AbortController();
    const b = new AbortController();
    const merged = mergeAbortSignals(a.signal, b.signal);

    b.abort();
    expect(merged.aborted).toBe(true);
  });

  it("handles an already-aborted signal immediately", () => {
    const aborted = new AbortController();
    aborted.abort();
    const live = new AbortController();

    const merged = mergeAbortSignals(aborted.signal, live.signal);
    expect(merged.aborted).toBe(true);
  });

  it("filters out null and undefined entries", () => {
    const controller = new AbortController();
    const merged = mergeAbortSignals(null, undefined, controller.signal, null);
    expect(merged).toBe(controller.signal);
  });
});

describe("queryKeys uniqueness (H-19)", () => {
  it("recipes.list and recipes.detail produce distinct keys", () => {
    const listKey = JSON.stringify(queryKeys.recipes.list({}));
    const detailKey = JSON.stringify(queryKeys.recipes.detail("x"));
    expect(listKey).not.toBe(detailKey);
  });

  it("recipes.all is a prefix of recipes.list", () => {
    const allKey = queryKeys.recipes.all;
    const listKey = queryKeys.recipes.list({});
    // list key must start with the same segment as all
    expect(listKey[0]).toBe(allKey[0]);
    // but must have more segments so invalidation is scoped
    expect(listKey.length).toBeGreaterThan(allKey.length);
  });

  it("recipes.list does not collide with recipes.detail", () => {
    // ["recipes", "list", ...] vs ["recipes", "detail", ...]
    const listKey = queryKeys.recipes.list({});
    const detailKey = queryKeys.recipes.detail("x");
    expect(listKey[1]).toBe("list");
    expect(detailKey[1]).toBe("detail");
  });

  it("posts.list and posts.detail produce distinct keys", () => {
    const listKey = JSON.stringify(queryKeys.posts.list({}));
    const detailKey = JSON.stringify(queryKeys.posts.detail("x"));
    expect(listKey).not.toBe(detailKey);
  });

  it("posts.list does not collide with posts.detail", () => {
    const listKey = queryKeys.posts.list({});
    const detailKey = queryKeys.posts.detail("x");
    expect(listKey[1]).toBe("list");
    expect(detailKey[1]).toBe("detail");
  });
});
