import { Page, expect } from "@playwright/test";

/* ------------------------------------------------------------------ */
/*  Shared utilities for E2E tests                                    */
/* ------------------------------------------------------------------ */

/**
 * Wait for the page to be fully loaded and ready.
 * Waits for network to idle and ensures body is rendered.
 */
export async function waitForHydration(page: Page) {
  // Wait for the page to be fully loaded
  await page.waitForLoadState("networkidle");
}

/**
 * Assert page has no console errors (ignoring known benign ones).
 */
export async function assertNoConsoleErrors(page: Page) {
  const errors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      // Ignore known benign errors
      const benign = [
        "favicon.ico",
        "Failed to load resource",
        "Download the React DevTools",
        "Third-party cookie",
        "ERR_CONNECTION_REFUSED",
      ];
      if (!benign.some((b) => text.includes(b))) {
        errors.push(text);
      }
    }
  });

  return {
    check: () => expect(errors).toEqual([]),
  };
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
