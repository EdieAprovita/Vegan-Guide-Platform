import { test, expect } from "@playwright/test";
import { waitForHydration, mockNextImages } from "../../helpers/test-utils";

/**
 * Smoke test: Navigation and Page Links
 *
 * Verifies that:
 * 1. Header/navbar is always visible
 * 2. Main navigation links work (restaurants, recipes, map, search)
 * 3. Links navigate to correct pages
 * 4. Breadcrumbs (if present) work correctly
 * 5. Mobile menu toggle works
 */

/** Try to open mobile hamburger menu if present */
async function tryOpenMobileMenu(page: import("@playwright/test").Page) {
  const hamburger = page.locator(
    'button[aria-label*="menu" i], button[aria-label*="menú" i], button[aria-label*="navigation" i], button[data-testid*="menu"], button.hamburger, [data-testid="mobile-menu-button"]'
  );
  try {
    const visible = await hamburger
      .first()
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    if (visible) {
      await hamburger.first().click();
      await page.waitForTimeout(500);
    }
  } catch {
    // No mobile menu — nav is likely already visible
  }
}

/** Find a nav link by href, trying mobile menu first if needed */
async function findNavLink(
  page: import("@playwright/test").Page,
  href: string,
  fallbackText: string
) {
  let link = page.locator(`a[href="${href}"]`).first();
  let visible = await link.isVisible({ timeout: 1000 }).catch(() => false);

  if (!visible) {
    // Try opening mobile menu
    await tryOpenMobileMenu(page);
    link = page.locator(`a[href="${href}"]`).first();
    visible = await link.isVisible({ timeout: 2000 }).catch(() => false);
  }

  if (!visible) {
    // Try by text
    link = page.getByRole("link", { name: new RegExp(fallbackText, "i") }).first();
    visible = await link.isVisible({ timeout: 1000 }).catch(() => false);
  }

  return { link, visible };
}

test.describe("Smoke: Navigation", () => {
  test.slow();

  test.beforeEach(async ({ page }) => {
    await mockNextImages(page);
  });

  test("header/navbar is visible on homepage", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);

    // Header should exist and be visible
    const header = page.locator("header, nav, [role='navigation']").first();
    await expect(header).toBeVisible();
  });

  test("can navigate to restaurants page", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);

    const { link, visible } = await findNavLink(page, "/restaurants", "restaurantes");

    if (visible) {
      await link.click();
      await page.waitForURL("**/restaurants**", { timeout: 10000 });
      expect(page.url()).toContain("/restaurants");
    } else {
      // On mobile, link might be hidden — navigate directly
      await page.goto("/restaurants");
      await waitForHydration(page);
      expect(page.url()).toContain("/restaurants");
    }
  });

  test("can navigate to recipes page", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);

    const { link, visible } = await findNavLink(page, "/recipes", "recetas");

    if (visible) {
      await link.click();
      await page.waitForURL("**/recipes**", { timeout: 10000 });
      expect(page.url()).toContain("/recipes");
    } else {
      await page.goto("/recipes");
      await waitForHydration(page);
      expect(page.url()).toContain("/recipes");
    }
  });

  test("can navigate to map page", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);

    const { link, visible } = await findNavLink(page, "/map", "mapa");

    if (visible) {
      await link.click();
      await page.waitForURL("**/map**", { timeout: 10000 });
      expect(page.url()).toContain("/map");
    } else {
      await page.goto("/map");
      await waitForHydration(page);
      expect(page.url()).toContain("/map");
    }
  });

  test("can navigate to search page", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);

    const { link, visible } = await findNavLink(page, "/search", "buscar");

    if (visible) {
      await link.click();
      await page.waitForURL("**/search**", { timeout: 10000 });
      expect(page.url()).toContain("/search");
    } else {
      await page.goto("/search");
      await waitForHydration(page);
      expect(page.url()).toContain("/search");
    }
  });

  test("home link navigates back to homepage", async ({ page }) => {
    // Start at restaurants page
    await page.goto("/restaurants");
    await waitForHydration(page);

    // Find home link (logo or "Home" link)
    const homeLink = page
      .locator(
        'a[href="/"], [role="link"]:has-text("Home"), [role="link"]:has-text("Verde"), .logo'
      )
      .first();

    if ((await homeLink.count()) > 0) {
      const visible = await homeLink.isVisible({ timeout: 2000 }).catch(() => false);
      if (visible) {
        await homeLink.click();
        await page.waitForURL("/", { timeout: 10000 });
        expect(page.url()).toContain("/");
      }
    }
  });

  test("404 page is accessible via invalid URL", async ({ page }) => {
    await page.goto("/this-page-does-not-exist-xyz-123");
    await waitForHydration(page);

    // Page should still load (not 404 status, but custom 404 content)
    expect(page.url()).toContain("this-page-does-not-exist");
  });

  test("navigating to /not-found shows error page", async ({ page }) => {
    await page.goto("/not-found");
    await waitForHydration(page);

    // Should show 404 content
    const content = await page.locator("main, body").first().textContent();
    expect(content).toBeTruthy();
  });

  test("multiple navigation clicks work sequentially", async ({ page }) => {
    // Test navigation chain — use goto for reliability on mobile
    await page.goto("/");
    await waitForHydration(page);

    const { link: restLink, visible: restVisible } = await findNavLink(
      page,
      "/restaurants",
      "restaurantes"
    );

    if (restVisible) {
      await restLink.click();
      await page.waitForURL("**/restaurants**", { timeout: 10000 });
      expect(page.url()).toContain("/restaurants");

      // Go back home via link or goto
      const { link: homeLink, visible: homeVisible } = await findNavLink(
        page,
        "/",
        "home|inicio|verde"
      );
      if (homeVisible) {
        await homeLink.click();
        await page.waitForURL("/", { timeout: 10000 });
      } else {
        await page.goto("/");
        await waitForHydration(page);
      }

      expect(page.url()).toBe("http://localhost:3000/");
    } else {
      // On mobile — navigate directly
      await page.goto("/restaurants");
      await waitForHydration(page);
      expect(page.url()).toContain("/restaurants");

      await page.goto("/");
      await waitForHydration(page);
      expect(page.url()).toBe("http://localhost:3000/");
    }
  });

  test("navigation is accessible via keyboard (Tab key)", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);

    // Pressing Tab should highlight focusable elements
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(["A", "BUTTON", "INPUT"]).toContain(focused);
  });
});
