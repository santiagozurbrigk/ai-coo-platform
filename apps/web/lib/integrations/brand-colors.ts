import type { IntegrationProvider } from "@/constants/integrations";

export type IntegrationBrand = {
  /** Color hex para el fondo sólido del logo. */
  bg: string;
  /** Clase Tailwind para el fondo, cuando la marca es un gradiente. */
  bgClass?: string;
};

/** Colores de marca: ícono blanco sobre fondo sólido (estilo app icon real). */
export const INTEGRATION_BRAND_COLORS: Record<
  IntegrationProvider,
  IntegrationBrand
> = {
  // Ventas y conversaciones
  zernio: { bg: "#6366F1" },
  manychat: { bg: "#0084FF" },
  calendly: { bg: "#006BFF" },
  ghl: { bg: "#E9A700" },
  fathom: { bg: "#007299" },
  unipile_instagram: {
    bg: "#C13584",
    bgClass: "bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045]",
  },
  unipile_whatsapp: { bg: "#25D366" },
  // Marketing y contenido
  google_ecosystem: { bg: "#4285F4" },
  youtube: { bg: "#FF0000" },
  instagram: {
    bg: "#C13584",
    bgClass: "bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045]",
  },
  typeform: { bg: "#262627" },
  google_forms: { bg: "#7248B9" },
  // Embudos
  vturb: { bg: "#1B1B1F" },
  webinarjam: { bg: "#2E7DD1" },
  hyros: { bg: "#111827" },
  // Cobros
  whop: { bg: "#FF6243" },
  fanbasis: { bg: "#0F172A" },
  stripe: { bg: "#635BFF" },
  mercadopago: { bg: "#00B1EA" },
  // Operación y datos
  discord: { bg: "#5865F2" },
  clickup: { bg: "#7B68EE" },
};

/**
 * Proveedores con logo vectorial en `public/integrations/`.
 *
 * Los que no están acá se dibujan con su inicial sobre el color de marca. Es
 * deliberado: inventar un logo aproximado de una marca ajena queda peor que una
 * inicial honesta, y un `<img>` roto queda peor que las dos.
 */
const PROVIDERS_WITH_LOGO = new Set<IntegrationProvider>([
  "zernio",
  "manychat",
  "calendly",
  "ghl",
  "fathom",
  "unipile_instagram",
  "unipile_whatsapp",
  "google_ecosystem",
  "youtube",
  "instagram",
  "typeform",
  "google_forms",
  "stripe",
  "mercadopago",
  "discord",
  "clickup",
]);

export function hasIntegrationLogo(provider: IntegrationProvider): boolean {
  return PROVIDERS_WITH_LOGO.has(provider);
}

export function integrationLogoSrc(provider: IntegrationProvider): string {
  if (provider === "unipile_instagram") return "/integrations/instagram.svg";
  if (provider === "unipile_whatsapp") return "/integrations/whatsapp.svg";
  if (provider === "google_ecosystem") return "/integrations/google_forms.svg";
  return `/integrations/${provider}.svg`;
}
