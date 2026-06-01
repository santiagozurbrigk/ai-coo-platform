/**
 * Rutas públicas del logo — archivos en apps/web/public/brand/
 * @see apps/web/public/brand/README.md
 */

export const brandAssets = {
  /** Isotipo — tema claro */
  logoIsotipoLight: "/brand/ISOTIPO%20OTC%20NEGRO.png",
  /** Isotipo — tema oscuro */
  logoIsotipoDark: "/brand/ISOTIPO%20OTC%20BLANCO.png",
  /** Logo horizontal (login, landing) */
  logo: "/brand/logo.png",
  favicon: "/favicon.ico",
} as const;

export type BrandTheme = "light" | "dark";

/** Isotipo OTC según tema (sidebar, menú móvil, colapsado). */
export function getThemeIsotipoSrc(theme: BrandTheme): string {
  return theme === "dark"
    ? brandAssets.logoIsotipoDark
    : brandAssets.logoIsotipoLight;
}
