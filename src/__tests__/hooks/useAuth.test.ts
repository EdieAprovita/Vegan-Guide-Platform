import { renderHook, act } from "@testing-library/react";
import { useAuthWithRouter } from "@/hooks/useAuth";
import { useAuthStore } from "@/lib/store/auth";
import * as authApi from "@/lib/api/auth";
import { signIn, signOut, useSession } from "next-auth/react";
import { toast } from "sonner";

const pushMock = jest.fn();

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  useSession: jest.fn(() => ({ data: null, status: "unauthenticated" })),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock("@/lib/api/auth", () => ({
  register: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
}));

const useSessionMock = useSession as jest.Mock;
const signOutMock = signOut as jest.Mock;
const toastSuccessMock = toast.success as jest.Mock;
const toastErrorMock = toast.error as jest.Mock;

describe("useAuthWithRouter login", () => {
  beforeEach(() => {
    const state = useAuthStore.getState();
    state.setIsLoggingIn(false);
    state.setAuthModalOpen(true);
    jest.clearAllMocks();
    useSessionMock.mockReturnValue({ data: null, status: "unauthenticated" });
  });

  it("logs in successfully", async () => {
    (signIn as jest.Mock).mockResolvedValue({ ok: true });

    const { result } = renderHook(() => useAuthWithRouter());

    await act(async () => {
      await result.current.login({ email: "test@example.com", password: "Password1" });
    });

    expect(signIn).toHaveBeenCalledWith("credentials", {
      email: "test@example.com",
      password: "Password1",
      redirect: false,
    });
    expect(useAuthStore.getState().isLoggingIn).toBe(false);
    expect(useAuthStore.getState().authModalOpen).toBe(false);
  });

  it("handles login error", async () => {
    (signIn as jest.Mock).mockResolvedValue({ error: "Invalid credentials" });

    const { result } = renderHook(() => useAuthWithRouter());

    await act(async () => {
      await expect(result.current.login({ email: "x@x.com", password: "bad" })).rejects.toThrow(
        "Invalid credentials"
      );
    });
    expect(useAuthStore.getState().isLoggingIn).toBe(false);
    expect(useAuthStore.getState().authModalOpen).toBe(true);
  });
});

describe("useAuthWithRouter register", () => {
  beforeEach(() => {
    const state = useAuthStore.getState();
    state.setIsRegistering(false);
    state.setAuthModalOpen(true);
    jest.clearAllMocks();
  });

  it("registers successfully", async () => {
    (authApi.register as jest.Mock).mockResolvedValue({
      _id: "1",
      username: "test",
      email: "t@e.com",
      role: "user",
      createdAt: "",
      isAdmin: false,
    });

    const { result } = renderHook(() => useAuthWithRouter());

    await act(async () => {
      await result.current.register({
        username: "test",
        email: "t@e.com",
        password: "Password1",
        confirmPassword: "Password1",
        role: "user",
      });
    });

    expect(authApi.register).toHaveBeenCalled();
    expect(useAuthStore.getState().isRegistering).toBe(false);
    expect(useAuthStore.getState().authModalOpen).toBe(false);
  });

  it("handles register error", async () => {
    (authApi.register as jest.Mock).mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useAuthWithRouter());

    await act(async () => {
      await expect(
        result.current.register({
          username: "test",
          email: "t@e.com",
          password: "Password1",
          confirmPassword: "Password1",
          role: "user",
        })
      ).rejects.toThrow("fail");
    });

    expect(useAuthStore.getState().isRegistering).toBe(false);
    expect(useAuthStore.getState().authModalOpen).toBe(true);
  });
});

describe("useAuthWithRouter additional error paths", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    const state = useAuthStore.getState();
    state.setIsSendingResetEmail(false);
    state.setIsUpdatingProfile(false);
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("handles forgot password error and resets loading state", async () => {
    (authApi.forgotPassword as jest.Mock).mockRejectedValue(new Error("reset failed"));

    const { result } = renderHook(() => useAuthWithRouter());

    await act(async () => {
      await expect(
        result.current.forgotPassword({
          email: "test@example.com",
        })
      ).rejects.toThrow("reset failed");
    });

    expect(useAuthStore.getState().isSendingResetEmail).toBe(false);
    expect(toastErrorMock).toHaveBeenCalled();
  });

  it("resets password and redirects to login", async () => {
    (authApi.resetPassword as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuthWithRouter());

    await act(async () => {
      await result.current.resetPassword(
        { password: "Password1", confirmPassword: "Password1" },
        "token-123"
      );
    });

    expect(pushMock).toHaveBeenCalledWith("/login");
    expect(toastSuccessMock).toHaveBeenCalled();
  });

  it("throws not authenticated on profile update when session is missing", async () => {
    useSessionMock.mockReturnValue({ data: null, status: "unauthenticated" });
    const { result } = renderHook(() => useAuthWithRouter());

    await act(async () => {
      await expect(
        result.current.updateProfile({
          username: "new-user",
        })
      ).rejects.toThrow("Not authenticated");
    });
  });

  it("handles profile update API errors and clears loading state", async () => {
    useSessionMock.mockReturnValue({
      data: { user: { id: "u1", email: "test@example.com" } },
      status: "authenticated",
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Profile update failed" }),
    }) as unknown as typeof fetch;

    const { result } = renderHook(() => useAuthWithRouter());

    await act(async () => {
      await expect(result.current.updateProfile({ username: "new-user" })).rejects.toThrow(
        "Profile update failed"
      );
    });

    expect(useAuthStore.getState().isUpdatingProfile).toBe(false);
    expect(toastErrorMock).toHaveBeenCalled();
  });

  it("handles logout failure without throwing", async () => {
    signOutMock.mockRejectedValue(new Error("logout failed"));
    const { result } = renderHook(() => useAuthWithRouter());

    await act(async () => {
      await expect(result.current.logout()).resolves.toBeUndefined();
    });

    expect(toastErrorMock).toHaveBeenCalledWith("Logout failed. Please try again.");
  });
});
