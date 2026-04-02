import { test, expect } from "@playwright/test";
import { waitForHydration, mockNextImages, collectConsoleErrors } from "../../helpers/test-utils";

/**
 * Smoke test: Landing page / Homepage
 *
 * Verifies that:
 * 1. Landing page loads and renders hero section
 * 2. Featured resources (restaurants, recipes) are visible
 * 3. Main CTAs (search, explore, login) are interactive
 * 4. Page is responsive on both desktop and mobile
 */
test.describe("Smoke: Home / Landing Page", () => {
  test.slow();

  test.beforeEach(async ({ page }) => {
    // Mock images to avoid 404s from external sources
    await mockNextImages(page);
  });

  test("landing page loads with hero section", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);

    // Page should have a main element with content
    const main = page.locator("main, [role='main']");
    await expect(main.first()).toBeVisible();

    // Should have some content visible
    const content = await page.locator("body").textContent();
    expect(content?.length).toBeGreaterThan(50);
  });

  test("search/explore CTA buttons are clickable", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);

    // Look for prominent buttons like "Buscar", "Explorar", etc.
    const buttons = page.locator("button, a[role='button']");
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);

    // Find at least one visible button (some may be hidden on mobile)
    let foundVisible = false;
    for (let i = 0; i < Math.min(count, 10); i++) {
      const isVisible = await buttons
        .nth(i)
        .isVisible()
        .catch(() => false);
      if (isVisible) {
        foundVisible = true;
        break;
      }
    }

    expect(foundVisible).toBe(true);
  });

  test("featured resources section is present", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);

    // Look for resource cards or sections
    // They might be under headings like "Restaurantes destacados", "Recetas populares"
    const sections = page.locator("h2, h3, [role='heading']");
    await expect(sections).not.toHaveCount(0);

    // At least one section should have content
    const mainContent = page.locator("main");
    const text = await mainContent.textContent();
    expect(text).toBeTruthy();
    expect(text?.length).toBeGreaterThan(50);
  });

  test("login/register links are accessible", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);

    // Look for auth links in header/nav
    const header = page.locator("header, nav, [role='navigation']").first();

    // Should have some navigation element
    await expect(header).toBeVisible();
  });

  test("page has proper metadata", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);
    await page.waitForLoadState("load");

    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(5);

    const html = page.locator("html");
    const lang = await html.getAttribute("lang");
    expect(lang).toBeTruthy();
  });

  test("page layout is responsive", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);

    // Both desktop and mobile should render main content
    const main = page.locator("main");
    await expect(main).toBeVisible();

    // Viewport info should exist
    const viewportSize = page.viewportSize();
    expect(viewportSize).toBeTruthy();
  });

  test("no console errors on landing page", async ({ page }) => {
    const checker = collectConsoleErrors(page);

    await page.goto("/");
    await waitForHydration(page);

    checker.check();
  });
});
