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

  /* 2 workers on CI (ubuntu-latest has 2 vCPUs). Parallelises intentional
   * delays (LCP timers, slow-API mocks) so they don't block the whole suite.
   * Do NOT exceed 2 on a 2-vCPU runner — CPU contention makes tests flakier. */
  workers: process.env.CI ? 2 : undefined,

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

  /* Auto-start Next.js server before tests.
   *
   * In CI we run against the production build ("npm start") so that:
   * - There is no HMR WebSocket — "networkidle" and "domcontentloaded" both
   *   settle predictably and pages load 5–10x faster than the dev server.
   * - OTel instrumentation module-not-found warnings are suppressed (no HMR
   *   recompile loop).
   * - The build artifact uploaded by the build job is reused (no double build).
   *
   * Locally, "npm run dev" is kept for fast iteration with hot reload.
   * The build job must run first and download the .next artifact before this
   * job starts (see ci.yml: needs: [build]).
   */
  webServer: {
    command: process.env.CI ? "npm start" : "npm run dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
