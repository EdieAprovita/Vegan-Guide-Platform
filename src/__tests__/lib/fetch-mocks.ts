/**
 * Shared fetch mock helpers for lib API tests.
 *
 * Usage:
 *   import { mockOkJson, mockError, setupFetchMocks } from "./fetch-mocks";
 *
 *   setupFetchMocks(); // registers beforeEach / afterEach automatically
 *
 *   it("...", async () => {
 *     mockOkJson({ success: true, data: [] });
 *     ...
 *   });
 */

export function mockOkJson(data: unknown): void {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    headers: { get: () => "application/json" },
    json: jest.fn().mockResolvedValue(data),
  });
}

export function mockError(status: number, message: string): void {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: false,
    status,
    statusText: "Error",
    headers: { get: () => "application/json" },
    json: jest.fn().mockResolvedValue({ message }),
  });
}

/**
 * Registers beforeEach / afterEach hooks that swap global.fetch with a
 * Jest mock for each test and restore the original afterwards.
 *
 * Call this once at the top of each test file, outside any describe block.
 */
export function setupFetchMocks(): void {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    global.fetch = originalFetch;
  });
}
