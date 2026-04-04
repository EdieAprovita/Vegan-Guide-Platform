/**
 * Unit tests for src/lib/api/auth.ts
 *
 * All network calls are made via apiRequest (which calls global.fetch internally).
 * We mock global.fetch to control responses without any real I/O.
 */

import {
  login,
  register,
  logout,
  revokeAllSessions,
  getProfile,
  forgotPassword,
  resetPassword,
  updateUserProfile,
} from "@/lib/api/auth";
import { API_CONFIG } from "@/lib/api/config";
import type { User } from "@/types";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockUser: User = {
  _id: "user-123",
  username: "veganuser",
  email: "vegan@example.com",
  role: "user",
  photo: "https://example.com/photo.jpg",
  createdAt: "2024-01-01T00:00:00.000Z",
};

const successResponse = (data: unknown) => ({
  ok: true,
  status: 200,
  headers: { get: () => "application/json" },
  json: jest.fn().mockResolvedValue(data),
});

const errorResponse = (status: number, message: string) => ({
  ok: false,
  status,
  statusText: "Error",
  headers: { get: () => "application/json" },
  json: jest.fn().mockResolvedValue({ message }),
});

const originalFetch = global.fetch;

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
  global.fetch = originalFetch;
});

// ---------------------------------------------------------------------------
// login()
// ---------------------------------------------------------------------------

describe("login()", () => {
  const credentials = { email: "vegan@example.com", password: "Password1" };

  it("returns the parsed User on a successful response", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(successResponse(mockUser));

    const result = await login(credentials);

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_CONFIG.BASE_URL}/users/login`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(credentials),
      })
    );
    expect(result).toEqual(mockUser);
  });

  it("throws when the server returns a non-ok status", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(errorResponse(401, "Invalid credentials"));

    await expect(login(credentials)).rejects.toThrow("Invalid credentials");
  });

  it("throws when fetch rejects (network failure)", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    await expect(login(credentials)).rejects.toThrow("Network error");
  });
});

// ---------------------------------------------------------------------------
// register()
// ---------------------------------------------------------------------------

describe("register()", () => {
  const registerData = {
    username: "veganuser",
    email: "vegan@example.com",
    password: "Password1",
    confirmPassword: "Password1",
    role: "user" as const,
  };

  it("returns the created User on a successful response", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(successResponse(mockUser));

    const result = await register(registerData);

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_CONFIG.BASE_URL}/users/register`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(registerData),
      })
    );
    expect(result).toEqual(mockUser);
  });

  it("throws when the server returns 400 (validation error)", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(errorResponse(400, "Email already in use"));

    await expect(register(registerData)).rejects.toThrow("Email already in use");
  });

  it("throws when the server returns 500", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(errorResponse(500, "Internal server error"));

    await expect(register(registerData)).rejects.toThrow("Internal server error");
  });
});

// ---------------------------------------------------------------------------
// logout()
// ---------------------------------------------------------------------------

describe("logout()", () => {
  it("calls the blacklist endpoint when a token is provided", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(successResponse(null));

    await logout("valid-token");

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_CONFIG.BASE_URL}/auth/logout`,
      expect.objectContaining({ method: "POST" })
    );
  });

  it("does NOT call the API when no token is provided", async () => {
    await logout();

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("does not throw when the logout endpoint returns an error (non-blocking)", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(errorResponse(500, "Server error"));

    await expect(logout("some-token")).resolves.toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// revokeAllSessions()
// ---------------------------------------------------------------------------

describe("revokeAllSessions()", () => {
  it("calls the revoke-all-tokens endpoint", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(successResponse(null));

    await revokeAllSessions("admin-token");

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_CONFIG.BASE_URL}/auth/revoke-all-tokens`,
      expect.objectContaining({ method: "POST" })
    );
  });

  it("throws when the server returns an error", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(errorResponse(403, "Forbidden"));

    await expect(revokeAllSessions("bad-token")).rejects.toThrow("Forbidden");
  });
});

// ---------------------------------------------------------------------------
// getProfile()
// ---------------------------------------------------------------------------

describe("getProfile()", () => {
  it("returns the User profile when authenticated", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(successResponse(mockUser));

    const result = await getProfile("valid-token");

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_CONFIG.BASE_URL}/users/profile`,
      expect.anything()
    );
    expect(result).toEqual(mockUser);
  });

  it("throws 'Not authenticated' when an empty token is passed", async () => {
    await expect(getProfile("")).rejects.toThrow("Not authenticated");
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// forgotPassword()
// ---------------------------------------------------------------------------

describe("forgotPassword()", () => {
  it("calls the forgot-password endpoint with the user email", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(successResponse(null));

    await forgotPassword({ email: "vegan@example.com" });

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_CONFIG.BASE_URL}/users/forgot-password`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "vegan@example.com" }),
      })
    );
  });

  it("throws when the server returns a non-ok response", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(errorResponse(404, "User not found"));

    await expect(forgotPassword({ email: "ghost@example.com" })).rejects.toThrow("User not found");
  });
});

// ---------------------------------------------------------------------------
// resetPassword()
// ---------------------------------------------------------------------------

describe("resetPassword()", () => {
  const newPasswordData = { password: "NewPass1", confirmPassword: "NewPass1" };
  const resetToken = "reset-token-abc";

  it("calls the reset-password endpoint including the reset token in the body", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(successResponse(null));

    await resetPassword(newPasswordData, resetToken);

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_CONFIG.BASE_URL}/users/reset-password`,
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ ...newPasswordData, token: resetToken }),
      })
    );
  });

  it("throws when the reset token is invalid", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(errorResponse(400, "Invalid or expired token"));

    await expect(resetPassword(newPasswordData, "bad-token")).rejects.toThrow(
      "Invalid or expired token"
    );
  });
});

// ---------------------------------------------------------------------------
// updateUserProfile()
// ---------------------------------------------------------------------------

describe("updateUserProfile()", () => {
  it("sends a PUT request with partial profile data", async () => {
    const updated = { ...mockUser, username: "newname" };
    (global.fetch as jest.Mock).mockResolvedValue(successResponse(updated));

    const result = await updateUserProfile({ username: "newname" }, "valid-token");

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_CONFIG.BASE_URL}/users/profile`,
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ username: "newname" }),
      })
    );
    expect(result.username).toBe("newname");
  });

  it("throws 'Not authenticated' when an empty token is passed", async () => {
    await expect(updateUserProfile({ username: "x" }, "")).rejects.toThrow("Not authenticated");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("throws when the server returns an error", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(errorResponse(422, "Validation failed"));

    await expect(updateUserProfile({ username: "x" }, "token")).rejects.toThrow(
      "Validation failed"
    );
  });
});
