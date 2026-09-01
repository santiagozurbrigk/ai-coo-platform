"use client";

import { cn } from "@/lib/utils";

export interface ChartLegendItem {
  label: string;
  color: string;
  /** Valor mostrado junto al label (etiqueta directa). */
  value?: string;
}

/**
 * Leyenda de series.
 *
 * Va **siempre** que el gráfico tenga dos o más series: sin ella la identidad
 * queda codificada sólo en el color y sólo alcanzable por hover, que no existe
 * en touch ni en teclado. Con `value` cada entrada además etiqueta el dato, así
 * el número es legible sin pasar el mouse.
 */
export function ChartLegend({
  items,
  className,
  align = "center",
}: {
  items: ChartLegendItem[];
  className?: string;
  align?: "center" | "start";
}) {
  if (items.length === 0) return null;

  return (
    <ul
      className={cn(
        "flex flex-wrap gap-x-4 gap-y-1.5 text-caption",
        align === "center" ? "justify-center" : "justify-start",
        className
      )}
    >
      {items.map((item) => (
        <li key={item.label} className="flex min-w-0 items-center gap-1.5">
          <span
            aria-hidden
            className="h-2 w-2 shrink-0 rounded-[2px]"
            style={{ background: item.color }}
          />
          <span className="truncate text-muted-foreground">{item.label}</span>
          {item.value ? (
            <span className="shrink-0 font-medium tabular-nums text-foreground">
              {item.value}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
