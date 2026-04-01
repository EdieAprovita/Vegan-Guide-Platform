import { test as base, Page } from "@playwright/test";
import { encode } from "@auth/core/jwt";
import { mockUser, mockAdmin, jsonResponse } from "../helpers/api-mocks";

// The secret must match the one used by the Next.js server (AUTH_SECRET env var).
// In CI: "ci-placeholder-secret-not-used-in-production"
// Locally: from .env.local
const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "your-super-secret-key-here-change-this-in-production";

// Cookie name mirrors SESSION_COOKIE_NAME from src/lib/auth.ts.
// In CI (NODE_ENV=production && CI=true), it's "next-auth.session-token".
// Locally (NODE_ENV=development), it's also "next-auth.session-token".
const SESSION_COOKIE_NAME = "next-auth.session-token";

/* ------------------------------------------------------------------ */
/*  Auth fixtures — reusable logged-in sessions for E2E tests         */
/*                                                                     */
/*  Usage:                                                             */
/*    import { test } from "../fixtures/auth.fixture";                 */
/*    test("my test", async ({ authedPage }) => { ... });              */
/* ------------------------------------------------------------------ */

const API = "**/api/v1";

/** Shape of a mock user for E2E auth setup */
type MockUser = {
  _id: string;
  username: string;
  email: string;
  role: string;
  photo: string;
  token: string;
  refreshToken: string;
};

/**
 * Encode a real JWT and inject it as a session cookie so the Next.js
 * middleware can verify the session server-side. Without this cookie,
 * protected routes redirect to /login regardless of client-side mocks.
 */
async function injectSessionCookie(page: Page, user: MockUser) {
  const token = await encode({
    token: {
      sub: user._id,
      id: user._id,
      name: user.username,
      email: user.email,
      role: user.role,
      backendToken: user.token,
      backendRefreshToken: user.refreshToken,
      backendTokenExpiry: Date.now() + 14 * 60 * 1000,
    },
    secret: AUTH_SECRET,
    salt: SESSION_COOKIE_NAME,
  });

  await page.context().addCookies([
    {
      name: SESSION_COOKIE_NAME,
      value: token,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
      secure: false,
    },
  ]);
}

/**
 * Inject a NextAuth session cookie and mock auth-related API endpoints
 * so that the app believes the user is logged in.
 *
 * This function intercepts requests at the page level and mocks:
 * - NextAuth session/CSRF/provider endpoints (frontend router)
 * - Backend API endpoints for user profile, reviews, etc. (external localhost:8000)
 *
 * All requests are mocked to prevent the E2E tests from hitting a real backend
 * that may not exist in CI or may be in an unknown state.
 */
async function setupAuthSession(page: Page, user: MockUser) {
  // Inject a real JWT cookie so server-side middleware can verify the session.
  // This must happen before navigation so the cookie is present on the first request.
  await injectSessionCookie(page, user);

  // NextAuth session endpoint (called by useSession() hook)
  await page.route("**/api/auth/session", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: {
          id: user._id,
          name: user.username,
          email: user.email,
          image: user.photo || null,
          role: user.role,
          token: user.token,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }),
    })
  );

  // NextAuth CSRF token endpoint
  await page.route("**/api/auth/csrf", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ csrfToken: "mock-csrf-token-e2e" }),
    })
  );

  // NextAuth providers endpoint
  await page.route("**/api/auth/providers", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        credentials: { id: "credentials", name: "Credentials", type: "credentials" },
      }),
    })
  );

  // Next.js BFF route for the profile form (src/app/api/user/profile/route.ts).
  // The ProfileForm client component calls fetch("/api/user/profile") in its
  // useEffect. With serviceWorkers:"block" in playwright.config.ts, this
  // browser-side fetch goes through the normal network stack and page.route()
  // CAN intercept it. Without this default mock, tests that don't register
  // their own handler would hit the Route Handler, which in turn tries to
  // reach the backend — unavailable in CI — and returns 500.
  //
  // Individual tests that need specific field values register their own
  // page.route("**/api/user/profile") AFTER this fixture runs; due to
  // Playwright's LIFO ordering, the test-specific handler takes precedence.
  await page.route("**/api/user/profile", (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill(
        jsonResponse({
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          photo: user.photo || "",
          firstName: "",
          lastName: "",
          bio: "",
          phone: "",
        })
      );
    }
    if (route.request().method() === "PUT") {
      return route.fulfill(
        jsonResponse({ ...user, ...JSON.parse(route.request().postData() || "{}") })
      );
    }
    return route.continue();
  });

  // Backend user profile endpoint (localhost:8000/api/v1/users/profile/:id)
  // Intercept both GET (fetch) and PUT (update) operations
  await page.route("**/api/v1/users/profile/**", (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill(jsonResponse(user));
    }
    if (route.request().method() === "PUT") {
      return route.fulfill(
        jsonResponse({ ...user, ...JSON.parse(route.request().postData() || "{}") })
      );
    }
    return route.continue();
  });

  // Backend user by ID endpoint (localhost:8000/api/v1/users/:id)
  await page.route(`**/api/v1/users/${user._id}**`, (route) => route.fulfill(jsonResponse(user)));

  // Catch-all for other backend endpoints (localhost:8000/api/v1/**)
  // Return a reasonable mock response or 404 to prevent timeouts waiting for
  // a backend server that doesn't exist in CI.
  await page.route("**/api/v1/**", (route) => {
    const method = route.request().method();
    const url = route.request().url();

    // Recipes, restaurants, markets, doctors: return empty array
    if (
      url.includes("/recipes") ||
      url.includes("/restaurants") ||
      url.includes("/markets") ||
      url.includes("/doctors")
    ) {
      if (method === "GET") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, data: [] }),
        });
      }
    }

    // Tags endpoint: return empty array
    if (url.includes("/tags")) {
      if (method === "GET") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, data: [] }),
        });
      }
    }

    // Default: 404 for unmatched backend endpoints
    return route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ success: false, error: "Mock endpoint not found" }),
    });
  });

  // Navigate to home to establish the authenticated session.
  // "domcontentloaded" is used instead of "networkidle" because the dev server
  // keeps the HMR WebSocket open and the app calls an external API on load —
  // both prevent "networkidle" from ever resolving in CI, burning the full timeout.
  try {
    await page.goto("/", { waitUntil: "domcontentloaded", timeout: 10000 });
  } catch {
    // Navigation might fail, but routes are set up
  }
}

type AuthFixtures = {
  /** Page with a regular user session pre-configured */
  authedPage: Page;
  /** Page with an admin session pre-configured */
  adminPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authedPage: async ({ page }, use) => {
    await setupAuthSession(page, mockUser);
    await use(page); // NOSONAR — Playwright fixture API, not a React Hook
  },

  adminPage: async ({ page }, use) => {
    await setupAuthSession(page, mockAdmin);
    await use(page); // NOSONAR — Playwright fixture API, not a React Hook
  },
});

export { expect } from "@playwright/test";
