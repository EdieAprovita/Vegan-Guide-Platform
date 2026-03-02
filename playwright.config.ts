import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E configuration for Verde Guide Platform.
 *
 * Strategy:
 * - Chromium + Mobile Chrome for realistic coverage
 * - Network mocking for API responses (no real backend needed)
 * - Traces & screenshots on failure for debugging
 * - webServer auto-starts Next.js dev server
 */
export default defineConfig({
  testDir: "./e2e/specs",
  timeout: 30_000,
  expect: { timeout: 5_000 },

  /* Run tests in parallel */
  fullyParallel: true,

  /* Fail CI if test.only is left in code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Limit workers on CI to avoid OOM */
  workers: process.env.CI ? 1 : undefined,

  /* Reporters */
  reporter: [
    ["html", { open: "never" }],
    ["list"],
    ...(process.env.CI
      ? [["junit", { outputFile: "e2e-results.xml" }] as const]
      : []),
  ],

  /* Shared settings for all projects */
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  /* Browser projects */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 5"] },
    },
  ],

  /* Auto-start Next.js dev server before tests */
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
