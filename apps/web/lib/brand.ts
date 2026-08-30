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

/**
 * Rutas públicas del logo — archivos en apps/web/public/brand/
 *
 * El manual presenta el logotipo en monocromo: negro sobre fondos claros,
 * blanco sobre oscuros. Por eso cada marca tiene par light/dark y los
 * componentes de `components/brand/` eligen según el tema.
 */
export const brandAssets = {
  /** Lockup horizontal (isotipo + wordmark) para fondos claros */
  logoLight: "/brand/logo-light.png",
  /** Lockup horizontal para fondos oscuros */
  logoDark: "/brand/logo-dark.png",
  /** Isotipo solo — sidebar colapsada, avatares */
  logoIconLight: "/brand/isotipo-light.svg",
  logoIconDark: "/brand/isotipo-dark.svg",
  /** Isotipo en naranja de marca — sobre fondos neutros */
  logoIconAccent: "/brand/isotipo-naranja.svg",
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
  /** Naranja Vibrant — acento único de la marca. --primary / hsl(22 85% 48%) */
  primary: "#E15D12",
  /** --primary-light — naranja claro, legible sobre negro */
  primaryLight: "#F58747",
  /** Un paso más claro aún, para series de charts */
  primaryLighter: "#F9AE81",
  /** --primary-hover — estados hover/pressed */
  primaryHover: "#BD4F0F",
  /** Naranja profundo para series de charts */
  primaryDeep: "#8F3B0B",
  /** Negro de marca */
  black: "#000000",
  /** Blanco de marca */
  white: "#FFFFFF",
} as const;
