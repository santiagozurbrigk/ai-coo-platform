/**
 * Tests E2E — Módulo Holding
 *
 * Cubre el flujo crítico del beta tester:
 *   1. Dashboard holding carga con métricas y lista de negocios
 *   2. Dropdown de negocios es scrollable y permite cambiar de negocio
 *   3. Al entrar a un negocio, el contexto cambia (badge "Viendo como founder")
 *   4. Se puede volver a la vista general del holding
 *   5. El agente de negocio es accesible dentro del contexto de negocio
 */

import { test, expect } from "@playwright/test";
import { HOLDING_AUTH_FILE } from "./constants";

test.use({ storageState: HOLDING_AUTH_FILE });

test.describe("Holding — dashboard", () => {
  test("carga el dashboard con KPIs y lista de negocios", async ({ page }) => {
    await page.goto("/holding");

    // KPIs visibles
    await expect(
      page.getByText(/negocios|businesses/i).first()
    ).toBeVisible({ timeout: 10_000 });

    // Al menos un negocio listado
    const businessCards = page.locator("[data-testid='business-card'], .business-card");
    // Fallback: buscar por texto del botón "Entrar" que aparece por negocio
    const enterButtons = page.getByRole("button", { name: /entrar|enter/i });
    const count = await enterButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test("el dropdown de negocios muestra todos los negocios y es scrollable", async ({
    page,
  }) => {
    await page.goto("/holding");

    // Abrir el dropdown del switcher
    const switcherButton = page.getByTestId("business-switcher");
    await expect(switcherButton).toBeVisible({ timeout: 10_000 });
    await switcherButton.click();

    // El menú debe abrirse (Radix DropdownMenuContent renderiza en portal con role="menu")
    const menu = page.locator("[role='menu']");
    await expect(menu).toBeVisible({ timeout: 8_000 });

    // Debe haber al menos un item de negocio (además de "Vista general del holding")
    const items = menu.locator("[role='menuitem']");
    const itemCount = await items.count();
    expect(itemCount).toBeGreaterThan(1); // al menos "vista general" + 1 negocio

    // El menú no se sale de la ventana (scrollable)
    const menuBox = await menu.boundingBox();
    if (menuBox) {
      const viewportSize = page.viewportSize();
      if (viewportSize) {
        expect(menuBox.y + menuBox.height).toBeLessThanOrEqual(
          viewportSize.height + 5 // 5px de tolerancia
        );
      }
    }
  });
});

test.describe("Holding — switch de negocio", () => {
  test("entrar a un negocio cambia el contexto (badge visible)", async ({
    page,
  }) => {
    await page.goto("/holding");

    // Hacer click en "Entrar" del primer negocio
    const firstEnterButton = page.getByRole("button", { name: /entrar|enter/i }).first();
    await firstEnterButton.click();

    // Debe redirigir al dashboard del negocio
    await page.waitForURL(/dashboard/, { timeout: 15_000 });

    // Badge "Viendo como founder" debe estar visible
    await expect(
      page.getByText(/viendo como founder/i)
    ).toBeVisible({ timeout: 5_000 });
  });

  test("volver al holding limpia el contexto de negocio", async ({ page }) => {
    // Partimos desde dentro de un negocio
    await page.goto("/holding");
    await page.getByRole("button", { name: /entrar|enter/i }).first().click();
    await page.waitForURL(/dashboard/, { timeout: 15_000 });

    // Abrir dropdown y seleccionar "Vista general del holding"
    const switcherButton = page.getByTestId("business-switcher");
    await expect(switcherButton).toBeVisible({ timeout: 10_000 });
    await switcherButton.click();

    const holdingOption = page.getByRole("menuitem", {
      name: /vista general del holding/i,
    });
    await holdingOption.click();

    // Debe redirigir al holding
    await page.waitForURL(/holding/, { timeout: 15_000 });

    // Badge "Viendo como founder" ya NO debe estar visible
    await expect(page.getByText(/viendo como founder/i)).not.toBeVisible();
  });
});

test.describe("Holding — navegación dentro de negocio", () => {
  test.beforeEach(async ({ page }) => {
    // Entrar a un negocio antes de cada test de este grupo
    await page.goto("/holding");
    await page.getByRole("button", { name: /entrar|enter/i }).first().click();
    await page.waitForURL(/dashboard/, { timeout: 15_000 });
  });

  test("el agente de negocio es accesible", async ({ page }) => {
    await page.goto("/agent");
    await expect(page).toHaveURL(/agent/, { timeout: 5_000 });

    // El textarea de chat debe estar visible
    await expect(
      page.getByRole("textbox").or(page.locator("textarea")).first()
    ).toBeVisible({ timeout: 5_000 });
  });

  test("el módulo de clientes carga sin errores", async ({ page }) => {
    await page.goto("/clients");
    // No debe haber mensajes de error de contexto
    await expect(page.getByText(/sin acceso|unauthorized|error/i)).not.toBeVisible({
      timeout: 5_000,
    });
  });
});
