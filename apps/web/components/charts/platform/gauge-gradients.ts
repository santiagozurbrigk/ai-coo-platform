import { brandColors } from "@/lib/brand";

export type GaugeVariant = "default" | "inverted" | "margin" | "booking";

export interface GaugeGradients {
  active: [string, string];
  inactive: [string, string];
}

/**
 * El arco inactivo del gauge es una superficie, no un dato: tiene que seguir al
 * tema. Hardcodearlo deja un arco casi negro sobre una card blanca (o al revés).
 */
export function neutralGaugeGradients(isDark: boolean): GaugeGradients {
  return isDark
    ? { active: ["#FFFFFF", "#FFFFFF"], inactive: ["#222228", "#1a1a20"] }
    : { active: ["#0A0A0A", "#0A0A0A"], inactive: ["#E7E5E4", "#DEDBD9"] };
}

/** Variante de acento: el track es un tinte del naranja de marca, no un violeta. */
export function accentGaugeGradients(isDark: boolean): GaugeGradients {
  return isDark
    ? {
        active: [brandColors.primary, brandColors.primaryLight],
        inactive: ["#2A2119", "#1A1613"],
      }
    : {
        active: [brandColors.primary, brandColors.primaryHover],
        inactive: ["#F7E0D2", "#F0D6C4"],
      };
}

export function resolveGaugeGradients(
  variant: GaugeVariant,
  isDark: boolean
): GaugeGradients {
  return variant === "margin" || variant === "booking"
    ? accentGaugeGradients(isDark)
    : neutralGaugeGradients(isDark);
}
