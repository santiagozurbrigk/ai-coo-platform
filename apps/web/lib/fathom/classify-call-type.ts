export type FathomCallClassification =
  | "consulting"
  | "team"
  | "delivery"
  | "other";

const SALES_KEYWORDS = [
  "venta",
  "sales",
  "cierre",
  "closing",
  "demo",
  "discovery",
  "propuesta",
];

const TEAM_KEYWORDS = ["team", "equipo", "standup", "sync", "weekly", "reunion"];

const SERVICE_KEYWORDS = [
  "cliente",
  "client",
  "servicio",
  "service",
  "delivery",
  "onboarding",
  "consultoria",
];

export function classifyFathomCallTypeByTitle(
  title: string
): FathomCallClassification {
  const normalized = title.toLowerCase();

  if (SALES_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return "consulting";
  }
  if (TEAM_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return "team";
  }
  if (SERVICE_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return "delivery";
  }

  return "other";
}
