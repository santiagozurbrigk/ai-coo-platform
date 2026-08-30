import { paths } from "@/routes/paths";

/**
 * Rutas que manejan su propio chrome (alto completo, sin padding de página).
 * Compartido entre el layout clásico y el shell notch para que ambos traten
 * igual a estas pantallas.
 */
export const FULL_BLEED_PREFIXES = [
  paths.platform.agent.root,
  paths.platform.sales.inbox,
  paths.platform.product.root,
] as const;

export function isFullBleedPath(pathname: string): boolean {
  return FULL_BLEED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
