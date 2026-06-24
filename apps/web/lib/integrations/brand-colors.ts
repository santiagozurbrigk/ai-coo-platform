import type { IntegrationProvider } from "@/constants/integrations";

/** Colores de marca para logos en cards de integraciones (Simple Icons / guías públicas). */
export const INTEGRATION_BRAND_COLORS: Record<
  IntegrationProvider,
  { hex: string; bgClass: string }
> = {
  discord: { hex: "#5865F2", bgClass: "bg-[#5865F2]/12" },
  instagram: { hex: "#E4405F", bgClass: "bg-[#E4405F]/12" },
  stripe: { hex: "#635BFF", bgClass: "bg-[#635BFF]/12" },
  mercadopago: { hex: "#009EE3", bgClass: "bg-[#009EE3]/12" },
  manychat: { hex: "#0084FF", bgClass: "bg-[#0084FF]/12" },
  youtube: { hex: "#FF0000", bgClass: "bg-[#FF0000]/12" },
  typeform: { hex: "#262627", bgClass: "bg-[#262627]/10 dark:bg-[#262627]/25" },
  google_forms: { hex: "#7248B9", bgClass: "bg-[#7248B9]/12" },
  airtable: { hex: "#18BFFF", bgClass: "bg-[#18BFFF]/12" },
  notion: { hex: "#000000", bgClass: "bg-black/8 dark:bg-white/10" },
  google_sheets: { hex: "#0F9D58", bgClass: "bg-[#0F9D58]/12" },
  google_docs: { hex: "#4285F4", bgClass: "bg-[#4285F4]/12" },
  fathom: { hex: "#007299", bgClass: "bg-[#007299]/12" },
  loom: { hex: "#625DF5", bgClass: "bg-[#625DF5]/12" },
  calendly: { hex: "#006BFF", bgClass: "bg-[#006BFF]/12" },
  miro: { hex: "#050038", bgClass: "bg-[#FFD02F]/25" },
};

export function integrationLogoSrc(provider: IntegrationProvider): string {
  return `/integrations/${provider}.svg`;
}
