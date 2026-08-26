import type { IntegrationProvider } from "@/constants/integrations";

export type IntegrationBrand = {
  /** Color hex para el fondo sólido del logo */
  bg: string;
  /** Clase Tailwind para el fondo (soporte gradientes) */
  bgClass?: string;
  /** true = ícono blanco sobre fondo, false = ícono oscuro (logos claros) */
  whiteIcon?: boolean;
};

/** Colores de marca: ícono blanco sobre fondo sólido (estilo app icon real). */
export const INTEGRATION_BRAND_COLORS: Record<IntegrationProvider, IntegrationBrand> = {
  discord:          { bg: "#5865F2" },
  zernio:           { bg: "#6366F1" },
  unipile_instagram:{ bg: "#C13584", bgClass: "bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045]" },
  unipile_whatsapp: { bg: "#25D366" },
  instagram:        { bg: "#C13584", bgClass: "bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045]" },
  manychat:         { bg: "#0084FF" },
  youtube:          { bg: "#FF0000" },
  google_ecosystem: { bg: "#4285F4" },
  typeform:         { bg: "#262627" },
  google_forms:     { bg: "#7248B9" },
  airtable:         { bg: "#18BFFF" },
  notion:           { bg: "#000000" },
  google_sheets:    { bg: "#0F9D58" },
  google_docs:      { bg: "#4285F4" },
  fathom:           { bg: "#007299" },
  loom:             { bg: "#625DF5" },
  calendly:         { bg: "#006BFF" },
  miro:             { bg: "#050038" },
  clickup:          { bg: "#7B68EE" },
  ghl:              { bg: "#E9A700" },
};

export function integrationLogoSrc(provider: IntegrationProvider): string {
  if (provider === "unipile_instagram") return "/integrations/instagram.svg";
  if (provider === "unipile_whatsapp") return "/integrations/whatsapp.svg";
  if (provider === "zernio") return "/integrations/zernio.svg";
  if (provider === "google_ecosystem") return "/integrations/google_forms.svg";
  return `/integrations/${provider}.svg`;
}
