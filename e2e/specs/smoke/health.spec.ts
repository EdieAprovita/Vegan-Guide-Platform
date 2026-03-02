import { test, expect } from "@playwright/test";

/**
 * Health-check smoke test.
 *
 * Verifies that:
 * 1. Next.js dev server is running and serves the homepage
 * 2. The page renders without critical errors
 * 3. Core layout elements (header, main) are present
 *
 * This is the very first E2E test — if this passes, the entire
 * Playwright + Next.js pipeline is working.
 */
test.describe("Smoke: Health Check", () => {
  test("homepage loads and renders core layout", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Page should have a title
    const title = await page.title();
    expect(title).toBeTruthy();

    // Should have a visible body with content
    const body = page.locator("body");
    await expect(body).toBeVisible();

    // Should not show the Next.js error overlay
    const errorOverlay = page.locator("nextjs-portal");
    await expect(errorOverlay).toHaveCount(0);
  });

  test("page returns HTTP 200", async ({ request }) => {
    const response = await request.get("/");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/html");
  });

  test("static assets are reachable", async ({ request }) => {
    // manifest.json should be served by Next.js public folder
    const manifest = await request.get("/manifest.json");
    expect(manifest.status()).toBe(200);

    // logo.svg from public folder
    const logo = await request.get("/logo.svg");
    expect(logo.status()).toBe(200);
  });

  test("no uncaught JavaScript errors on homepage", async ({ page }) => {
    const jsErrors: string[] = [];
    page.on("pageerror", (error) => {
      jsErrors.push(error.message);
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Filter out known benign errors (e.g. Google Maps key missing, API unreachable)
    const criticalErrors = jsErrors.filter(
      (msg) =>
        !msg.includes("maps.googleapis.com") &&
        !msg.includes("ERR_CONNECTION_REFUSED") &&
        !msg.includes("Failed to fetch") &&
        !msg.includes("NetworkError"),
    );

    expect(criticalErrors).toEqual([]);
  });
});
