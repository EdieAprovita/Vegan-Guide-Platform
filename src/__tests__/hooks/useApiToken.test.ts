import { renderHook } from "@testing-library/react";
import { useApiToken } from "@/hooks/useApiToken";
import { useSession } from "next-auth/react";

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

const useSessionMock = useSession as jest.Mock;

describe("useApiToken (deprecated)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("always returns null token — token no longer exposed to client", () => {
    useSessionMock.mockReturnValue({
      data: { user: { name: "Test User", email: "test@example.com" } },
      status: "authenticated",
    });

    const { result } = renderHook(() => useApiToken());

    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it("returns isLoading true when status is loading", () => {
    useSessionMock.mockReturnValue({ data: null, status: "loading" });

    const { result } = renderHook(() => useApiToken());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("returns false isAuthenticated when unauthenticated", () => {
    useSessionMock.mockReturnValue({ data: null, status: "unauthenticated" });

    const { result } = renderHook(() => useApiToken());

    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });
});
