/**
 * Unit tests for src/lib/auth.ts
 *
 * NextAuth is mocked at module level so we can import and exercise the raw
 * config object (providers, callbacks, cookies) without spinning up a real
 * authentication server.
 */

// ---------------------------------------------------------------------------
// Module-level mocks — must be declared BEFORE any imports that depend on them.
// ---------------------------------------------------------------------------

jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    handlers: {},
    auth: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
  })),
}));

jest.mock("next-auth/providers/credentials", () => ({
  __esModule: true,
  default: jest.fn((options: unknown) => ({ provider: "credentials", ...(options as object) })),
}));

jest.mock("@/lib/api/tokenRefresh", () => ({
  refreshAccessToken: jest.fn(),
}));

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { config, SESSION_COOKIE_NAME } from "@/lib/auth";
import { refreshAccessToken } from "@/lib/api/tokenRefresh";
import type { NextAuthConfig } from "next-auth";

// Narrow the config to what NextAuth actually exposes so we can call callbacks.
type JwtCallback = NonNullable<NextAuthConfig["callbacks"]>["jwt"];
type SessionCallback = NonNullable<NextAuthConfig["callbacks"]>["session"];

const mockRefreshAccessToken = refreshAccessToken as jest.Mock;

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal NextAuth JWT token fixture. */
function makeToken(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    name: "Vegan User",
    email: "vegan@example.com",
    picture: null,
    sub: "user-123",
    ...overrides,
  };
}

/** Build a minimal NextAuth User fixture (returned by authorize). */
function makeUser(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "user-123",
    name: "Vegan User",
    email: "vegan@example.com",
    image: "https://example.com/photo.jpg",
    role: "user",
    token: "access-token-abc",
    refreshToken: "refresh-token-xyz",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// SESSION_COOKIE_NAME
// ---------------------------------------------------------------------------

describe("SESSION_COOKIE_NAME", () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it("uses the insecure name outside production", () => {
    // jest runs with NODE_ENV=test
    expect(SESSION_COOKIE_NAME).toBe("next-auth.session-token");
  });

  it("exports a non-empty string", () => {
    expect(typeof SESSION_COOKIE_NAME).toBe("string");
    expect(SESSION_COOKIE_NAME.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// config shape
// ---------------------------------------------------------------------------

describe("config shape", () => {
  it("uses jwt session strategy", () => {
    expect((config.session as { strategy: string }).strategy).toBe("jwt");
  });

  it("has trustHost enabled", () => {
    expect(config.trustHost).toBe(true);
  });

  it("configures the sign-in page to /login", () => {
    expect(config.pages?.signIn).toBe("/login");
  });

  it("sets httpOnly on the session token cookie", () => {
    const cookieOptions = config.cookies?.sessionToken?.options;
    expect(cookieOptions?.httpOnly).toBe(true);
  });

  it("sets sameSite to lax on the session token cookie", () => {
    const cookieOptions = config.cookies?.sessionToken?.options;
    expect(cookieOptions?.sameSite).toBe("lax");
  });

  it("sets path to / on the session token cookie", () => {
    const cookieOptions = config.cookies?.sessionToken?.options;
    expect(cookieOptions?.path).toBe("/");
  });

  it("includes at least one provider", () => {
    expect(config.providers.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// jwt callback
// ---------------------------------------------------------------------------

describe("jwt callback", () => {
  const jwtCallback = config.callbacks?.jwt as JwtCallback;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("populates token fields from user on initial sign-in", async () => {
    const token = makeToken();
    const user = makeUser();
    const now = Date.now();
    jest.spyOn(Date, "now").mockReturnValue(now);

    const result = await jwtCallback!({
      token,
      user: user as unknown as Parameters<NonNullable<JwtCallback>>[0]["user"],
      account: null,
      trigger: "signIn",
    } as Parameters<NonNullable<JwtCallback>>[0]);

    expect(result!.id).toBe("user-123");
    expect(result!.role).toBe("user");
    expect(result!.backendToken).toBe("access-token-abc");
    expect(result!.backendRefreshToken).toBe("refresh-token-xyz");
    expect(result!.backendTokenExpiry).toBe(now + 14 * 60 * 1000);
  });

  it("does not overwrite token when user is undefined (subsequent requests)", async () => {
    const now = Date.now();
    // Token is fresh — expiry is far in the future so no refresh is triggered.
    const token = makeToken({
      id: "user-123",
      role: "user",
      backendToken: "existing-access",
      backendRefreshToken: "existing-refresh",
      backendTokenExpiry: now + 10 * 60 * 1000, // 10 min from now
    });

    const result = await jwtCallback!({
      token,
      user: undefined as unknown as Parameters<NonNullable<JwtCallback>>[0]["user"],
      account: null,
      trigger: "update",
    } as Parameters<NonNullable<JwtCallback>>[0]);

    expect(result!.backendToken).toBe("existing-access");
    expect(result!.backendRefreshToken).toBe("existing-refresh");
    expect(mockRefreshAccessToken).not.toHaveBeenCalled();
  });

  it("calls refreshAccessToken when the token is within the refresh margin", async () => {
    const now = Date.now();
    // Expiry is 30 seconds from now — inside the 60 s refresh margin.
    const token = makeToken({
      backendToken: "old-access",
      backendRefreshToken: "valid-refresh",
      backendTokenExpiry: now + 30 * 1000,
    });

    mockRefreshAccessToken.mockResolvedValue({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    });

    const result = await jwtCallback!({
      token,
      user: undefined as unknown as Parameters<NonNullable<JwtCallback>>[0]["user"],
      account: null,
      trigger: "update",
    } as Parameters<NonNullable<JwtCallback>>[0]);

    expect(mockRefreshAccessToken).toHaveBeenCalledWith("valid-refresh");
    expect(result!.backendToken).toBe("new-access-token");
    expect(result!.backendRefreshToken).toBe("new-refresh-token");
    expect(result!.backendTokenExpiry).toBeGreaterThan(now);
  });

  it("sets error flag when refreshAccessToken throws", async () => {
    const now = Date.now();
    const token = makeToken({
      backendToken: "old-access",
      backendRefreshToken: "expired-refresh",
      backendTokenExpiry: now - 1000, // already expired
    });

    mockRefreshAccessToken.mockRejectedValue(new Error("Refresh failed"));

    const result = await jwtCallback!({
      token,
      user: undefined as unknown as Parameters<NonNullable<JwtCallback>>[0]["user"],
      account: null,
      trigger: "update",
    } as Parameters<NonNullable<JwtCallback>>[0]);

    expect(result!.error).toBe("RefreshTokenError");
  });

  it("does not trigger refresh when backendRefreshToken is absent", async () => {
    const now = Date.now();
    // Token is expired but there is no refresh token — should not call refresh.
    const token = makeToken({
      backendToken: "old-access",
      backendTokenExpiry: now - 5000,
      // backendRefreshToken intentionally omitted
    });

    const result = await jwtCallback!({
      token,
      user: undefined as unknown as Parameters<NonNullable<JwtCallback>>[0]["user"],
      account: null,
      trigger: "update",
    } as Parameters<NonNullable<JwtCallback>>[0]);

    expect(mockRefreshAccessToken).not.toHaveBeenCalled();
    expect(result!.error).toBeUndefined();
  });

  it("keeps existing refreshToken when backend does not return a new one", async () => {
    const now = Date.now();
    const token = makeToken({
      backendToken: "old-access",
      backendRefreshToken: "original-refresh",
      backendTokenExpiry: now + 30 * 1000,
    });

    // Backend returns only an accessToken (refreshToken sent via HttpOnly cookie)
    mockRefreshAccessToken.mockResolvedValue({
      accessToken: "new-access-token",
      // no refreshToken field
    });

    const result = await jwtCallback!({
      token,
      user: undefined as unknown as Parameters<NonNullable<JwtCallback>>[0]["user"],
      account: null,
      trigger: "update",
    } as Parameters<NonNullable<JwtCallback>>[0]);

    // refreshToken in JWT must remain unchanged when not returned by backend
    expect(result!.backendRefreshToken).toBe("original-refresh");
    expect(result!.backendToken).toBe("new-access-token");
  });
});

// ---------------------------------------------------------------------------
// session callback
// ---------------------------------------------------------------------------

describe("session callback", () => {
  const sessionCallback = config.callbacks?.session as SessionCallback;

  it("maps token.id and token.role onto session.user", async () => {
    const token = makeToken({
      id: "user-456",
      role: "professional",
    });

    const session = {
      user: {
        id: "",
        name: "Vegan User",
        email: "vegan@example.com",
        role: "user" as const,
      },
      expires: "2099-01-01",
    };

    const result = await sessionCallback!({
      session: session as Parameters<NonNullable<SessionCallback>>[0]["session"],
      token,
    } as Parameters<NonNullable<SessionCallback>>[0]);

    expect(result.user!.id).toBe("user-456");
    expect((result.user as Record<string, unknown>).role).toBe("professional");
  });

  it("does not expose backendToken in the session", async () => {
    const token = makeToken({
      id: "user-789",
      role: "admin",
      backendToken: "secret-server-side-token",
    });

    const session = {
      user: {
        id: "",
        name: "Admin",
        email: "admin@example.com",
        role: "admin" as const,
      },
      expires: "2099-01-01",
    };

    const result = await sessionCallback!({
      session: session as Parameters<NonNullable<SessionCallback>>[0]["session"],
      token,
    } as Parameters<NonNullable<SessionCallback>>[0]);

    // The session object must not leak the raw backend access token to clients.
    expect((result as unknown as Record<string, unknown>).backendToken).toBeUndefined();
    expect((result.user as unknown as Record<string, unknown>).backendToken).toBeUndefined();
  });
});
