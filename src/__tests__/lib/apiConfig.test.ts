import {
  API_CONFIG,
  apiRequest,
  extractBackendData,
  extractBackendListData,
  getApiHeaders,
  handleApiError,
  processBackendResponse,
} from "@/lib/api/config";

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

describe("processBackendResponse", () => {
  it("returns data from standard backend response", () => {
    const response = { success: true, data: [{ id: 1 }] };
    expect(processBackendResponse(response)).toEqual([{ id: 1 }]);
  });

  it("handles direct arrays and objects", () => {
    const arrayResponse = [{ id: 1 }];
    const objectResponse = { id: 2 };

    expect(processBackendResponse(arrayResponse)).toEqual(arrayResponse);
    expect(processBackendResponse(objectResponse)).toEqual(objectResponse);
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
