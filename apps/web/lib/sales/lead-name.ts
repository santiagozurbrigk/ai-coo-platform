/** Detecta nombres placeholder / ID de Unipile (ej. CF808xfg…). */
export function looksLikePlaceholderLeadName(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "Contacto") return true;
  if (trimmed.includes(" ")) return false;
  if (/^[A-Za-z0-9_-]{6,10}[…]{1}$/.test(trimmed)) return true;
  if (/^[A-Za-z0-9_-]{6,10}\.{2,3}$/.test(trimmed)) return true;
  if (/…$|\.\.\.$/.test(trimmed)) return true;
  return /^[A-Za-z0-9_-]{6,}$/.test(trimmed);
}

/**
 * Elige lead_name para upsert inbound.
 * En UPDATE nunca reemplaza un nombre real por un placeholder.
 */
export function pickInboundLeadName(
  existingLeadName: string | null | undefined,
  incomingLeadName: string,
  isInsert: boolean
): string {
  const incoming = incomingLeadName.trim();
  if (isInsert) return incoming || "Contacto";

  const existing = existingLeadName?.trim() ?? "";
  if (!existing) return incoming || "Contacto";

  const existingIsPlaceholder = looksLikePlaceholderLeadName(existing);
  const incomingIsPlaceholder = looksLikePlaceholderLeadName(incoming);

  if (!existingIsPlaceholder && incomingIsPlaceholder) return existing;
  if (existingIsPlaceholder && !incomingIsPlaceholder && incoming) return incoming;
  if (!existingIsPlaceholder && !incomingIsPlaceholder && incoming) return existing;

  return existing || incoming;
}
