/**
 * Normalise a locale-formatted numeric string to a JS-parseable one.
 *
 * Handles both English (1,234.5) and European/es-AR (1.234,5) conventions:
 *   "12.500"   → "12500"   (European thousands separator)
 *   "49,6"     → "49.6"    (European decimal separator)
 *   "1.234,56" → "1234.56" (European thousands + decimal)
 *   "12,500"   → "12500"   (English thousands separator)
 *   "12.5"     → "12.5"    (English decimal — unchanged)
 */
function normalizeNumPart(raw: string): string {
  const s = raw.replace(/\s/g, "");

  // European format: groups of 3 digits separated by ".", optional ",decimal" at end
  // e.g. "12.500", "1.234.567", "1.234,56"
  if (/^[0-9]{1,3}(\.[0-9]{3})+(,[0-9]{1,2})?$/.test(s)) {
    return s.replace(/\./g, "").replace(",", ".");
  }

  // European decimal only: digits,1–2digits (comma is decimal) e.g. "49,6", "14,30"
  if (/^[0-9]+,[0-9]{1,2}$/.test(s)) {
    return s.replace(",", ".");
  }

  // Default: English format — strip commas (thousands separators)
  return s.replace(/,/g, "");
}

export type ParsedMetricValue = {
  numeric: number;
  prefix: string;
  suffix: string;
  decimals: number;
};

export function parseAnimatableMetricValue(
  value: string | number
): ParsedMetricValue | null {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    return {
      numeric: value,
      prefix: "",
      suffix: "",
      decimals: Number.isInteger(value) ? 0 : 2,
    };
  }

  const str = String(value).trim();
  const match = str.match(/^([^0-9\-+]*)([-+]?[0-9][0-9,.\s]*)(.*)$/);
  if (!match) return null;

  const [, prefix, numPart, suffix] = match;
  const normalized = normalizeNumPart(numPart);
  const numeric = Number.parseFloat(normalized);
  if (!Number.isFinite(numeric)) return null;

  const fraction = normalized.split(".")[1];
  const decimals = fraction ? Math.min(fraction.length, 2) : 0;

  return { numeric, prefix, suffix, decimals };
}

export function formatAnimatedMetricValue(
  current: number,
  parsed: ParsedMetricValue
): string {
  const formatted =
    parsed.decimals > 0
      ? current.toLocaleString(undefined, {
          minimumFractionDigits: parsed.decimals,
          maximumFractionDigits: parsed.decimals,
        })
      : Math.round(current).toLocaleString();

  return `${parsed.prefix}${formatted}${parsed.suffix}`;
}
