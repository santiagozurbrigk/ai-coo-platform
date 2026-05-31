/** Convierte series {label, value} en filas con fecha para charts Bklit (eje temporal). */
export function toTimeSeriesRows(
  points: { label: string; value: number }[],
  extraKeys?: Record<string, number[]>
): Record<string, unknown>[] {
  const anchor = new Date();
  return points.map((p, i) => {
    const date = new Date(anchor);
    date.setDate(date.getDate() - (points.length - 1 - i));
    const row: Record<string, unknown> = {
      date,
      name: p.label,
      value: p.value,
    };
    if (extraKeys) {
      for (const [key, values] of Object.entries(extraKeys)) {
        row[key] = values[i] ?? 0;
      }
    }
    return row;
  });
}

export function toCategoryRows(
  items: { label: string; value: number; color?: string }[]
): Record<string, unknown>[] {
  return items.map((item) => ({
    name: item.label,
    value: item.value,
    color: item.color,
  }));
}
