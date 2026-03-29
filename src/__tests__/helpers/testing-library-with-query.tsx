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
/* eslint-disable */
import React from "react";

const realTLPath = require.resolve("@testing-library/react/pure");
const realTL = require(realTLPath) as typeof import("@testing-library/react");

const { renderHook: originalRenderHook } = realTL;

export * from "@testing-library/react/pure";

function QueryWrapper({ children }: { children: React.ReactNode }) {
  try {
    const { QueryClient, QueryClientProvider } = require("@tanstack/react-query");
    if (typeof QueryClient !== "function") return <>{children}</>;

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });

    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  } catch {
    return <>{children}</>;
  }
}
QueryWrapper.displayName = "QueryWrapper";

function tryCreateQueryWrapper(): React.ComponentType<{ children: React.ReactNode }> | undefined {
  try {
    const { QueryClient } = require("@tanstack/react-query");
    if (typeof QueryClient !== "function") return undefined;
    return QueryWrapper;
  } catch {
    return undefined;
  }
}

export function renderHook<Result, Props>(
  renderCallback: (props: Props) => Result,
  options?: Parameters<typeof originalRenderHook>[1]
): ReturnType<typeof originalRenderHook<Result, Props>> {
  const wrapper = options?.wrapper ?? tryCreateQueryWrapper();
  return originalRenderHook(renderCallback, {
    ...(options as object),
    ...(wrapper ? { wrapper } : {}),
  }) as ReturnType<typeof originalRenderHook<Result, Props>>;
}
