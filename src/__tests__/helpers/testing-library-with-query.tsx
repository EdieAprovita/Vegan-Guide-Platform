/**
 * Drop-in replacement for @testing-library/react that automatically wraps
 * renderHook calls with a QueryClientProvider when no wrapper is provided.
 *
 * This allows existing tests written for useState+useEffect hooks to work
 * with hooks migrated to TanStack Query without any test-file changes.
 *
 * When @tanstack/react-query is mocked (jest.mock), the auto-wrapping is
 * skipped gracefully so that query-mocking tests continue to work normally.
 *
 * Referenced via moduleNameMapper in jest.config.js.
 */
import React from "react";

// Load the REAL @testing-library/react via its resolved path on disk,
// bypassing the moduleNameMapper redirect that would cause infinite recursion.
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
const realTL: typeof import("@testing-library/react") = require(
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  "/Users/EACM/Developer/Vegan-Guide-Platform/node_modules/@testing-library/react/dist/index.js"
) as typeof import("@testing-library/react");

const { renderHook: originalRenderHook } = realTL;

// Re-export everything from the real module unchanged so that all
// screen, render, fireEvent, waitFor, act, etc. remain available.
// @ts-expect-error — absolute path bypasses TS module resolution but works at runtime
export * from "/Users/EACM/Developer/Vegan-Guide-Platform/node_modules/@testing-library/react/dist/index.js";

function tryCreateQueryWrapper(): React.ComponentType<{ children: React.ReactNode }> | undefined {
  try {
    // Dynamically require so that if @tanstack/react-query is jest.mock()'ed
    // and QueryClient is not a constructor, we gracefully fall back.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { QueryClient, QueryClientProvider } = require("@tanstack/react-query");
    if (typeof QueryClient !== "function") return undefined;

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });

    return ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
  } catch {
    return undefined;
  }
}

export function renderHook<Result, Props>(
  renderCallback: (props: Props) => Result,
  options?: Parameters<typeof originalRenderHook>[1]
): ReturnType<typeof originalRenderHook<Result, Props>> {
  // If the caller already provides a wrapper, respect it.
  // Otherwise try to inject a QueryClientProvider; if that's not possible
  // (e.g., @tanstack/react-query is mocked without QueryClient), run as-is.
  const wrapper = options?.wrapper ?? tryCreateQueryWrapper();
  return originalRenderHook(renderCallback, {
    ...(options as object),
    ...(wrapper ? { wrapper } : {}),
  }) as ReturnType<typeof originalRenderHook<Result, Props>>;
}
