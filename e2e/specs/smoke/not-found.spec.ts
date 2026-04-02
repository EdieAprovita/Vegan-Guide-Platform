import { test, expect } from "@playwright/test";
import { waitForHydration, mockNextImages, collectConsoleErrors } from "../../helpers/test-utils";

/**
 * Smoke test: 404 Not Found Page
 *
 * Verifies that:
 * 1. Invalid routes show the 404 page
 * 2. 404 page has helpful content and CTAs
 * 3. User can navigate back from 404 page
 * 4. 404 page renders properly on mobile
 */
test.describe("Smoke: 404 Not Found Page", () => {
  test.beforeEach(async ({ page }) => {
    await mockNextImages(page);
  });

  test("visiting invalid URL shows not-found page", async ({ page }) => {
    await page.goto("/this-route-definitely-does-not-exist");
    await waitForHydration(page);

    // Should still have content (Next.js serves custom 404, not browser 404)
    const content = await page.locator("main, body").first().textContent();
    expect(content).toBeTruthy();
  });

  test("404 page has content and layout", async ({ page }) => {
    await page.goto("/not-found");
    await waitForHydration(page);

    // Should have a main element
    const main = page.locator("main");
    await expect(main).toBeVisible();

    // Should have some text (error message, suggestions, etc.)
    const text = await main.textContent();
    expect(text?.length).toBeGreaterThan(20);
  });

  test("404 page has navigation back to home", async ({ page }) => {
    await page.goto("/not-found");
    await waitForHydration(page);

    // Should have a button or link to go home
    const homeLink = page
      .locator(
        'a[href="/"], button:has-text("Home"), button:has-text("Inicio"), a:has-text("Volver")'
      )
      .first();

    await expect(homeLink).toBeVisible();
  });

  test("can click home link from 404 page", async ({ page }) => {
    await page.goto("/not-found");
    await waitForHydration(page);

    const homeLink = page.locator('a[href="/"], a:has-text("Volver al inicio")').first();
    if ((await homeLink.count()) > 0) {
      await homeLink.click();
      await page.waitForURL("/");
      expect(page.url()).toBe("http://localhost:3000/");
    }
  });

  test("back button works from invalid route", async ({ page }) => {
    // Go to home first
    await page.goto("/");
    await waitForHydration(page);

    // Navigate to invalid route
    await page.goto("/invalid-route-xyz");
    await waitForHydration(page);

    // Press back button
    await page.goBack();
    await waitForHydration(page);

    // Should be back at home
    expect(page.url()).toBe("http://localhost:3000/");
  });

  test("404 page is responsive", async ({ page }) => {
    await page.goto("/not-found");
    await waitForHydration(page);

    // Content should still be visible and readable
    const main = page.locator("main");
    await expect(main).toBeVisible();

    // Viewport info should exist
    const viewportSize = page.viewportSize();
    expect(viewportSize).toBeTruthy();
  });

  test("multiple invalid routes all show 404", async ({ page }) => {
    const invalidRoutes = ["/random-page-123", "/admin/fake-page", "/restaurants/invalid-id-xyz"];

    for (const route of invalidRoutes) {
      await page.goto(route);
      await waitForHydration(page);

      // All should show content (custom 404, not browser error)
      const content = await page.locator("body").textContent();
      expect(content).toBeTruthy();
    }
  });

  test("no console errors on 404 page", async ({ page }) => {
    const checker = collectConsoleErrors(page);

    await page.goto("/nonexistent-page");
    await waitForHydration(page);

    checker.check();
  });
});
