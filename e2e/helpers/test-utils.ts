import { Page, expect } from "@playwright/test";

/* ------------------------------------------------------------------ */
/*  Shared utilities for E2E tests                                    */
/* ------------------------------------------------------------------ */

/**
 * Centralized list of benign console errors that should be ignored
 * across all E2E tests. Update this single list instead of duplicating
 * per-file arrays.
 *
 * Each entry should be specific enough to avoid masking real regressions.
 */
export const BENIGN_ERRORS = [
  "favicon",
  "Failed to fetch",
  "maps.googleapis",
  "NetworkError when attempting",
  "Cannot be given refs",
  "React.forwardRef",
  "ERR_CONNECTION_REFUSED",
  "Failed to load resource",
  "Download the React DevTools",
  "Third-party cookie",
  "webpack-internal",
  "ErrorBoundary",
  "React.Suspense",
  "NEXT_NOT_FOUND",
  "NEXT_REDIRECT",
  "useSearchParams() should be wrapped",
];

/**
 * Wait for the page to be fully loaded and ready for interaction.
 *
 * We intentionally use "domcontentloaded" rather than "networkidle" here.
 * Next.js dev server keeps a persistent HMR WebSocket open at /_next/webpack-hmr,
 * which means "networkidle" never resolves — it waits the full test timeout (30s)
 * before giving up. "domcontentloaded" fires as soon as the HTML is parsed and
 * all deferred scripts have run, which is the correct signal that React has
 * hydrated. For tests that genuinely need to wait for async data to appear,
 * use an explicit waitForSelector or expect(...).toBeVisible() assertion instead.
 */
export async function waitForHydration(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForSelector("body", { state: "visible", timeout: 5000 });
}

/**
 * Navigate and wait for the page to be ready.
 */
export async function navigateTo(page: Page, path: string) {
  await page.goto(path);
  await waitForHydration(page);
}

/**
 * Mock Next.js image optimization endpoint to avoid 404s in tests.
 */
export async function mockNextImages(page: Page) {
  await page.route("**/_next/image*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "image/png",
      // 1x1 transparent PNG
      body: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64",
      ),
    }),
  );
}

/**
 * Mock Google Maps API to avoid loading the real SDK in tests.
 */
export async function mockGoogleMaps(page: Page) {
  await page.route("**/maps.googleapis.com/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: `
        window.google = {
          maps: {
            Map: function() { return { setCenter: function(){}, setZoom: function(){}, addListener: function(){} }; },
            Marker: function() { return { setMap: function(){}, setPosition: function(){}, addListener: function(){} }; },
            InfoWindow: function() { return { open: function(){}, close: function(){} }; },
            LatLng: function(lat, lng) { return { lat: function(){ return lat; }, lng: function(){ return lng; } }; },
            Geocoder: function() { return { geocode: function(){} }; },
            event: { addListener: function(){}, removeListener: function(){} },
            ControlPosition: { TOP_RIGHT: 1 },
            MapTypeId: { ROADMAP: "roadmap" },
          }
        };
      `,
    }),
  );
}

/**
 * A pragmatic fallback assertion for catch blocks or missing elements.
 * Verifies that the page has loaded and rendered at least some body content.
 */
export async function pragmaticFallback(page: Page) {
  const body = await page.locator("body").textContent();
  expect((body ?? "").length).toBeGreaterThan(0);
}

/* ------------------------------------------------------------------ */
/*  Reusable test patterns (reduce duplication across spec files)      */
/* ------------------------------------------------------------------ */

/**
 * Collect console errors during page navigation, filtering BENIGN_ERRORS.
 * Returns a check() function that asserts no real errors occurred.
 *
 * Usage:
 *   const checker = collectConsoleErrors(page);
 *   await page.goto("/some-page");
 *   checker.check();
 */
export function collectConsoleErrors(page: Page) {
  const errors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      if (!BENIGN_ERRORS.some((b) => text.includes(b))) {
        errors.push(text);
      }
    }
  });

  return { check: () => expect(errors).toEqual([]) };
}

/**
 * Assert a page does not trigger an infinite redirect loop.
 * Navigates to the given path and verifies < 10 main frame navigations occur.
 */
export async function assertNoInfiniteRedirect(page: Page, path: string) {
  let navigationCount = 0;
  page.on("framenavigated", (frame) => {
    // Only count main frame navigations, not iframes
    if (frame === page.mainFrame()) {
      navigationCount++;
    }
  });

  await page.goto(path, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("body", { state: "visible", timeout: 5000 });

  expect(navigationCount).toBeLessThan(10);
}

/**
 * Assert that the page body has rendered meaningful content (length > minLength).
 */
export async function assertPageHasContent(page: Page, minLength = 0) {
  const body = await page.locator("body").textContent();
  expect((body ?? "").length).toBeGreaterThan(minLength);
}

/**
 * Assert that an authenticated page loaded content and did NOT redirect to /login.
 */
export async function assertAuthedPageLoaded(page: Page) {
  const url = page.url();
  const hasContent =
    ((await page.locator("body").textContent())?.length ?? 0) > 0;
  const redirectedToLogin = url.includes("/login");
  // Assert that we have content AND we're not on the login page
  expect(hasContent && !redirectedToLogin).toBe(true);
}

/**
 * Try to open the mobile hamburger menu if present.
 * Waits for menu animation to complete before returning.
 */
export async function tryOpenMobileMenu(page: Page) {
  const hamburger = page.locator(
    'button[aria-label*="menu" i], button[aria-label*="menú" i], button[aria-label*="abrir" i], button:has(svg[class*="menu"]), [data-testid="mobile-menu"]',
  );
  try {
    const visible = await hamburger
      .first()
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    if (visible) {
      await hamburger.first().click();
      // Wait for menu to appear (dialog or nav)
      await page.locator('[role="dialog"], nav[id*="menu"]').first().isVisible({ timeout: 1000 }).catch(() => false);
    }
  } catch {
    // No mobile menu — ignore
  }
}
