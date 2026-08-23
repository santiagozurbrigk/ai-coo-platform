import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E — OTC Web
 *
 * Corre contra la app local en http://localhost:3000.
 * Para correr: pnpm exec playwright test
 * Para ver UI: pnpm exec playwright test --ui
 *
 * Variables de entorno requeridas para tests E2E:
 *   E2E_HOLDING_EMAIL    — email de una cuenta holding de test
 *   E2E_HOLDING_PASSWORD — contraseña de esa cuenta
 *   E2E_BASE_URL         — URL base (default: http://localhost:3000)
 */

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"]],

  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // Chromium pre-instalado en el entorno de CI
    ...(process.env.PLAYWRIGHT_BROWSERS_PATH
      ? { executablePath: "/opt/pw-browsers/chromium/chrome" }
      : {}),
  },

  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/holding.json",
      },
      dependencies: ["setup"],
    },
  ],

  // Levantar la app Next.js automáticamente si no hay servidor corriendo
  // Descomentar para desarrollo local:
  // webServer: {
  //   command: "pnpm dev",
  //   url: "http://localhost:3000",
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120_000,
  // },
});
