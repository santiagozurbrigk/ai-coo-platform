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
  const match = str.match(/^([^0-9\-+]*)([\-+]?[0-9][0-9,.\s]*)(.*)$/);
  if (!match) return null;

  const [, prefix, numPart, suffix] = match;
  const normalized = numPart.replace(/\s/g, "").replace(/,/g, "");
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
