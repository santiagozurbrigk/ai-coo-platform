"use client";

import { GlassPanel } from "@ai-coo/ui";

interface SummaryItem {
  label: string;
  value: string;
}

interface SummaryStripProps {
  items: SummaryItem[];
}

/**
 * Franja inferior de resumen con métricas distribuidas simétricamente.
 * Cada columna ocupa el mismo espacio con grid de columnas iguales.
 */
export function SummaryStrip({ items }: SummaryStripProps) {
  if (items.length === 0) return null;

  return (
    <GlassPanel className="mb-2 overflow-hidden p-0">
      <div
        className="grid divide-x divide-border"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => (
          <div key={item.label} className="flex flex-col gap-0.5 px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap truncate">
              {item.label}
            </p>
            <p className="text-lg font-bold tabular-nums leading-none">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
