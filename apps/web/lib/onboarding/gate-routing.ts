/**
 * Decide si una request tiene que ir al gate de onboarding.
 *
 * Vive separada del middleware y sin IO porque el modo de falla de esta lógica
 * es un **loop de redirects**: dos reglas que se mandan la request una a la
 * otra tumban la aplicación entera, y no se ve en un typecheck ni en un build.
 * Acá se puede testear cada combinación.
 */

export type GateRoutingInput = {
  role: string | null;
  organizationId: string | null;
  accountType: string | null;
  skipOnboarding: boolean;
  /** `profiles.must_change_password` */
  mustChangePassword: boolean;
  /** `onboarding_state.gate_completed_at` */
  gateCompletedAt: string | null;
  pathname: string;
  /** Rutas que el middleware ya deja pasar sin sesión. */
  isPublicPath: boolean;
  isOnboardingGatePath: boolean;
  isForcePasswordChangePath: boolean;
  /** Server Actions y otras requests que no toleran un redirect a HTML. */
  isNonNavigationRequest: boolean;
};

export function shouldRedirectToGate(input: GateRoutingInput): boolean {
  // El gate es cosa del founder: nadie más puede completarlo.
  if (input.role !== "founder") return false;
  if (!input.organizationId) return false;

  /*
   * El cambio de contraseña forzado va PRIMERO.
   *
   * Toda cuenta nueva llega con contraseña temporal, así que sin esta guarda
   * las dos reglas se pelean: el middleware manda a `/auth/force-password-change`
   * por la contraseña y, como esa ruta no es pública, el gate la rebota a
   * `/onboarding` — ERR_TOO_MANY_REDIRECTS en el primer login de cada cuenta
   * nueva, que es exactamente a quien está dirigido el gate.
   */
  if (input.mustChangePassword) return false;
  if (input.isForcePasswordChangePath) return false;

  // Ya está en el gate, o en una ruta que se sirve sin sesión.
  if (input.isOnboardingGatePath) return false;
  if (input.isPublicPath) return false;

  // Un redirect devuelve HTML: sobre un fetch rompe al cliente.
  if (input.isNonNavigationRequest) return false;

  // Los holdings tienen su propio onboarding y su propio ruteo.
  if (input.accountType === "holding") return false;
  // Salida de emergencia del super-admin.
  if (input.skipOnboarding) return false;

  return input.gateCompletedAt === null;
}
