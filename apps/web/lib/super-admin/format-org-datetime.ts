/** Fallback cuando la organización no tiene timezone configurada en Settings. */
export const DEFAULT_ORG_TIMEZONE = "America/Argentina/Buenos_Aires";

function resolveTimezone(timezone?: string | null): string {
  return timezone || DEFAULT_ORG_TIMEZONE;
}

/** Fecha corta en la zona horaria de la organización (estable entre SSR y cliente). */
export function formatOrgDate(
  iso: string | null,
  timezone?: string | null,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  }
): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es", {
    ...options,
    timeZone: resolveTimezone(timezone),
  });
}

/** Fecha y hora en la zona horaria de la organización (estable entre SSR y cliente). */
export function formatOrgDateTime(
  iso: string | null,
  timezone?: string | null,
  options: Intl.DateTimeFormatOptions = {}
): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es", {
    ...options,
    timeZone: resolveTimezone(timezone),
  });
}
