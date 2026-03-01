import { renderHook } from "@testing-library/react";
import { useApiToken } from "@/hooks/useApiToken";
import { useSession } from "next-auth/react";

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

const useSessionMock = useSession as jest.Mock;

describe("useApiToken", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns null token and false isAuthenticated when session is unauthenticated", () => {
    useSessionMock.mockReturnValue({ data: null, status: "unauthenticated" });

    const { result } = renderHook(() => useApiToken());

    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("returns isLoading true when status is loading", () => {
    useSessionMock.mockReturnValue({ data: null, status: "loading" });

    const { result } = renderHook(() => useApiToken());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("returns token and isAuthenticated true when session has a token", () => {
    useSessionMock.mockReturnValue({
      data: { user: { token: "abc123", name: "Test User", email: "test@example.com" } },
      status: "authenticated",
    });

    const { result } = renderHook(() => useApiToken());

    expect(result.current.token).toBe("abc123");
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it("returns null token and false isAuthenticated when authenticated but token is missing", () => {
    useSessionMock.mockReturnValue({
      data: { user: { name: "Test User", email: "test@example.com" } },
      status: "authenticated",
    });

    const { result } = renderHook(() => useApiToken());

    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("returns null token when user object is undefined in session", () => {
    useSessionMock.mockReturnValue({
      data: {},
      status: "authenticated",
    });

    const { result } = renderHook(() => useApiToken());

    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("returns false isAuthenticated when token is empty string", () => {
    // The hook uses ?? null (nullish coalescing), so an empty string passes through.
    // isAuthenticated requires !!token, which is false for empty string.
    useSessionMock.mockReturnValue({
      data: { user: { token: "", name: "Test User" } },
      status: "authenticated",
    });

    const { result } = renderHook(() => useApiToken());

    expect(result.current.token).toBe("");
    expect(result.current.isAuthenticated).toBe(false);
  });
});
