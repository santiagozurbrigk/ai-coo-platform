export type FathomCallClassification =
  | "consulting"
  | "team"
  | "delivery"
  | "other";

// Sales / closing call keywords (ES + EN)
const SALES_KEYWORDS = [
  // Spanish
  "llamada de venta",
  "llamada de ventas",
  "llamada de cierre",
  "llamada comercial",
  "call de ventas",
  "call de cierre",
  "call comercial",
  "venta directa",
  "venta inicial",
  "primer contacto",
  "cierre de venta",
  "reunion de venta",
  "reunión de venta",
  "venta",
  "cierre",
  "propuesta",
  "discovery",
  // English
  "closing call",
  "sales call",
  "discovery call",
  "demo call",
  "intro call",
  "sales",
  "closing",
  "demo",
];

// Team meeting keywords (ES + EN)
const TEAM_KEYWORDS = [
  // Spanish
  "llamada de equipo",
  "reunion de equipo",
  "reunión de equipo",
  "call de equipo",
  "equipo semanal",
  "sync de equipo",
  "sesion de equipo",
  "sesión de equipo",
  "reunion interna",
  "reunión interna",
  "equipo",
  // English
  "team meeting",
  "team call",
  "team sync",
  "team standup",
  "team weekly",
  "team",
  "standup",
  "weekly",
  "sync",
  "reunion",
];

// Delivery / client service keywords (ES + EN)
const SERVICE_KEYWORDS = [
  "sesion de coaching",
  "sesión de coaching",
  "sesion de mentoria",
  "sesión de mentoría",
  "entrega",
  "consultoria",
  "consultoría",
  "onboarding",
  "seguimiento",
  "servicio",
  "service",
  "delivery",
  "cliente",
  "client",
];

/**
 * Classifies a Fathom call by its title using keyword matching.
 * Order of precedence: sales → team → delivery → other.
 * Uses longest-match priority within each category to avoid false positives
 * (e.g. "llamada de equipo" beats standalone "equipo").
 */
export function classifyFathomCallTypeByTitle(
  title: string
): FathomCallClassification {
  const normalized = title.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  const matchesAny = (keywords: string[]) =>
    keywords
      .slice()
      .sort((a, b) => b.length - a.length) // longest first to prefer specific phrases
      .some((keyword) =>
        normalized.includes(
          keyword.normalize("NFD").replace(/[̀-ͯ]/g, "")
        )
      );

  if (matchesAny(SALES_KEYWORDS)) return "consulting";
  if (matchesAny(TEAM_KEYWORDS)) return "team";
  if (matchesAny(SERVICE_KEYWORDS)) return "delivery";

  return "other";
}
