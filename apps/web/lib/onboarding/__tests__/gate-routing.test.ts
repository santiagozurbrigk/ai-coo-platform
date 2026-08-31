/**
 * Ruteo del gate.
 *
 * El caso que da nombre a este archivo es el loop: el gate y el cambio de
 * contraseña forzado son dos reglas del mismo middleware, y si cada una manda
 * la request a la pantalla de la otra, el primer login de toda cuenta nueva
 * termina en ERR_TOO_MANY_REDIRECTS. Pasó en el preview el 2026-08-31.
 */

import { describe, it, expect } from "vitest";
import { shouldRedirectToGate, type GateRoutingInput } from "../gate-routing";

/** Founder de una org nueva navegando al panel: el caso que sí debe ir al gate. */
function input(patch: Partial<GateRoutingInput> = {}): GateRoutingInput {
  return {
    role: "founder",
    organizationId: "org-1",
    accountType: "founder",
    skipOnboarding: false,
    mustChangePassword: false,
    gateCompletedAt: null,
    pathname: "/dashboard",
    isPublicPath: false,
    isOnboardingGatePath: false,
    isForcePasswordChangePath: false,
    isNonNavigationRequest: false,
    ...patch,
  };
}

describe("shouldRedirectToGate — el caso base", () => {
  it("manda al gate a un founder de una org sin configurar", () => {
    expect(shouldRedirectToGate(input())).toBe(true);
  });

  it("no lo manda si ya lo cruzó", () => {
    expect(
      shouldRedirectToGate(input({ gateCompletedAt: "2026-08-31T12:00:00Z" }))
    ).toBe(false);
  });
});

describe("shouldRedirectToGate — el loop de redirects", () => {
  /*
   * Toda cuenta nueva llega con contraseña temporal. Sin estas dos guardas, el
   * middleware la manda a cambiar la contraseña y el gate la rebota de vuelta.
   */
  it("no interviene mientras la contraseña esté pendiente", () => {
    expect(shouldRedirectToGate(input({ mustChangePassword: true }))).toBe(false);
  });

  it("no saca a nadie de la pantalla de cambio de contraseña", () => {
    expect(
      shouldRedirectToGate(
        input({
          pathname: "/auth/force-password-change",
          isForcePasswordChangePath: true,
          mustChangePassword: true,
        })
      )
    ).toBe(false);
  });

  it("tampoco si llegó a esa pantalla sin tener la contraseña pendiente", () => {
    expect(
      shouldRedirectToGate(
        input({
          pathname: "/auth/force-password-change",
          isForcePasswordChangePath: true,
          mustChangePassword: false,
        })
      )
    ).toBe(false);
  });

  it("no se redirige a sí mismo estando ya en el gate", () => {
    expect(
      shouldRedirectToGate(
        input({ pathname: "/onboarding", isOnboardingGatePath: true })
      )
    ).toBe(false);
  });
});

describe("shouldRedirectToGate — a quién no le aplica", () => {
  it.each([
    ["un operator", { role: "operator" }],
    ["un viewer", { role: "viewer" }],
    ["un member", { role: "member" }],
    ["un admin", { role: "admin" }],
    ["sin rol", { role: null }],
  ])("no le aplica a %s", (_label, patch) => {
    expect(shouldRedirectToGate(input(patch))).toBe(false);
  });

  it("no le aplica a un holding: tiene su propio onboarding", () => {
    expect(shouldRedirectToGate(input({ accountType: "holding" }))).toBe(false);
  });

  it("no le aplica con skip_onboarding", () => {
    expect(shouldRedirectToGate(input({ skipOnboarding: true }))).toBe(false);
  });

  it("no le aplica sin organización resuelta", () => {
    expect(shouldRedirectToGate(input({ organizationId: null }))).toBe(false);
  });
});

describe("shouldRedirectToGate — requests que no toleran un redirect", () => {
  it("no redirige una ruta pública", () => {
    expect(
      shouldRedirectToGate(input({ pathname: "/login", isPublicPath: true }))
    ).toBe(false);
  });

  it("no redirige un fetch a la API ni una Server Action", () => {
    // Un redirect devuelve HTML: sobre un fetch rompe al cliente en vez de
    // mandarlo a ningún lado.
    expect(shouldRedirectToGate(input({ isNonNavigationRequest: true }))).toBe(
      false
    );
  });
});
