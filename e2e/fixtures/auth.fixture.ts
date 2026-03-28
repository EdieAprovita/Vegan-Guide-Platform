import { test as base, Page } from "@playwright/test";
import { mockUser, mockAdmin, jsonResponse } from "../helpers/api-mocks";

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
 * Inject a NextAuth session cookie and mock auth-related API endpoints
 * so that the app believes the user is logged in.
 */
async function setupAuthSession(page: Page, user: MockUser) {
  // Mock the NextAuth session endpoint that the client checks
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

  // Mock CSRF token endpoint
  await page.route("**/api/auth/csrf", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ csrfToken: "mock-csrf-token-e2e" }),
    })
  );

  // Mock providers endpoint
  await page.route("**/api/auth/providers", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        credentials: { id: "credentials", name: "Credentials", type: "credentials" },
      }),
    })
  );

  // Mock user profile endpoint
  await page.route(`${API}/users/${user._id}`, (route) => route.fulfill(jsonResponse(user)));

  await page.route(`${API}/users/profile/${user._id}`, (route) => {
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

  // Navigate to home to establish the authenticated session
  // This ensures the session check is intercepted and our mock is applied
  try {
    await page.goto("/", { waitUntil: "networkidle", timeout: 10000 });
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
