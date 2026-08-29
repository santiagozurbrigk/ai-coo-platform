/**
 * Identidad de marca — fuente única de verdad.
 *
 * Todo string de marca visible al usuario (nombre, razón social, tagline) y
 * toda ruta de asset debe salir de acá. No hardcodear "Limitless" en JSX ni en
 * plantillas de email: importar `brand` y usar el campo que corresponda.
 *
 * @see apps/web/public/brand/README.md — assets de imagen
 * @see DESIGN.md — paleta y tipografía
 */

export const brand = {
  /** Nombre en prosa — UI, emails, copy. */
  name: "Limitless",
  /** Wordmark en caja alta — headers, logo tipográfico, footer. */
  wordmark: "LIMITLESS",
  /** Razón social — textos legales (privacidad, términos). */
  legalName: "Limitless",
  /** Descripción corta — metadata, subjects de email. */
  tagline: "El sistema operativo con IA para negocios de infoproductos.",
  /**
   * Dominio público. Fuera del alcance del rebranding a Limitless — sigue
   * apuntando al dominio legado hasta que se migre el DNS.
   */
  domain: "optimizatucontrol.com",
} as const;

/** Rutas públicas del logo — archivos en apps/web/public/brand/ */
export const brandAssets = {
  /** Logo horizontal (sidebar expandida, landing, móvil) */
  logo: "/brand/logo.png",
  /** Isotipo — mismo archivo hasta tener logo-icon.png */
  logoIcon: "/brand/logo.png",
  favicon: "/favicon.ico",
} as const;

/**
 * Paleta de marca en hex — solo para contextos que NO pueden leer CSS vars:
 * props de color de charts (Visx), estilos inline y HTML de emails.
 *
 * En JSX y CSS usar los tokens de Tailwind (`bg-primary`, `text-primary-light`,
 * `bg-primary-hover`), que ya siguen el tema claro/oscuro.
 *
 * Mantener sincronizado con packages/ui/src/styles/tokens.css.
 */
export const brandColors = {
  /** --primary */
  primary: "#7C3AED",
  /** --primary-light */
  primaryLight: "#A78BFA",
  /** Un paso más claro que --primary-light */
  primaryLighter: "#C4B5FD",
  /** --primary-hover — estados hover/pressed */
  primaryHover: "#6D28D9",
  /** Violeta profundo para series de charts */
  primaryDeep: "#5B21B6",
} as const;
