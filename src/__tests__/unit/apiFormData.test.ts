/**
 * M-08: apiRequest — FormData body must not include Content-Type header.
 *
 * This file intentionally does NOT mock @/lib/api/config so the real
 * apiRequest implementation is exercised. fetch is replaced globally because
 * JSDOM does not define it as a configurable property (jest.spyOn fails).
 */

let originalFetch: typeof global.fetch;
let mockFetch: jest.Mock;

beforeEach(() => {
  originalFetch = global.fetch;
  mockFetch = jest.fn((_input: RequestInfo | URL, _opts?: RequestInit) =>
    Promise.resolve({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ success: true }),
    } as unknown as Response)
  );
  global.fetch = mockFetch;
});

afterEach(() => {
  global.fetch = originalFetch;
});

describe("M-08: apiRequest — FormData body does not send Content-Type", () => {
  it("does not include Content-Type header when body is FormData", async () => {
    const { apiRequest } = await import("@/lib/api/config");

    const formData = new FormData();
    formData.append("file", new Blob(["content"]), "test.jpg");

    await apiRequest("/upload", { method: "POST", body: formData });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [, fetchOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = fetchOptions.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBeUndefined();
  });

  it("includes Content-Type: application/json for non-FormData body", async () => {
    const { apiRequest } = await import("@/lib/api/config");

    await apiRequest("/posts", {
      method: "POST",
      body: JSON.stringify({ title: "test" }),
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [, fetchOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = fetchOptions.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
  });

  it("includes Content-Type: application/json for requests with no body", async () => {
    const { apiRequest } = await import("@/lib/api/config");

    await apiRequest("/posts");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [, fetchOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = fetchOptions.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
  });
});
