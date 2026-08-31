import { paths } from "@/routes/paths";

/**
 * Rutas que se renderizan sin el shell de plataforma: sin notch nav, sin panel,
 * a pantalla completa.
 *
 * Hoy sólo el gate de onboarding. Es deliberado que no incluya
 * `/onboarding/holding`: ese wizard viene mostrándose dentro del shell desde
 * antes y sacárselo sería un cambio de comportamiento ajeno a esta fase.
 */
const CHROMELESS_PATHS: string[] = [paths.platform.onboarding];

export function isChromelessPath(pathname: string): boolean {
  return CHROMELESS_PATHS.includes(pathname);
}
