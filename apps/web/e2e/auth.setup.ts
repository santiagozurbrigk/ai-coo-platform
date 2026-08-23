/**
 * Setup: autenticación compartida entre tests.
 *
 * Playwright guarda el estado de auth (cookies + localStorage) en un archivo
 * que los tests reutilizan sin volver a hacer login en cada test.
 *
 * Env vars requeridas:
 *   E2E_HOLDING_EMAIL     — email de la cuenta holding de test
 *   E2E_HOLDING_PASSWORD  — contraseña de esa cuenta
 */

import { test as setup, expect } from "@playwright/test";
import path from "path";

export const HOLDING_AUTH_FILE = path.join(__dirname, ".auth", "holding.json");

setup("autenticar cuenta holding", async ({ page }) => {
  const email = process.env.E2E_HOLDING_EMAIL;
  const password = process.env.E2E_HOLDING_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "E2E_HOLDING_EMAIL y E2E_HOLDING_PASSWORD son requeridas para los tests E2E"
    );
  }

  await page.goto("/auth/login");
  await expect(page).toHaveURL(/.*login.*/);

  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/contraseña|password/i).fill(password);
  await page.getByRole("button", { name: /iniciar sesión|login|entrar/i }).click();

  // Esperar redirección post-login — landing en holding o dashboard
  await page.waitForURL(/(holding|dashboard)/, { timeout: 15_000 });

  // Guardar estado de auth para reutilizar en los tests
  await page.context().storageState({ path: HOLDING_AUTH_FILE });
});
