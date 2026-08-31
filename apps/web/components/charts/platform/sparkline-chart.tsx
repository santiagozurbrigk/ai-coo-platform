"use client";

import { AreaChart, Area } from "@/components/charts/area-chart";
import { toTimeSeriesRows } from "@/lib/chart/bklit-data";
import { cn } from "@/lib/utils";

export function SparklineChart({
  data,
  color = "var(--chart-1)",
  className,
  /** Override del aspect ratio del SVG. "none" desactiva el constraint (útil en
   *  contenedores con altura fija donde se requiere ancho completo). */
  aspectRatio = "3 / 1",
}: {
  data: number[];
  color?: string;
  className?: string;
  aspectRatio?: string;
}) {
  if (data.length < 2) return null;

  const points = data.map((value, i) => ({
    label: String(i),
    value,
  }));
  const rows = toTimeSeriesRows(points);

  return (
    <AreaChart
      data={rows}
      xDataKey="date"
      aspectRatio={aspectRatio}
      className={cn("h-full w-full min-h-[32px]", className)}
      animationDuration={700}
      margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
    >
      <Area
        dataKey="value"
        fill={color}
        stroke={color}
        // Relleno degradado a transparente: al 0.25 plano el sparkline se leía
        // como un bloque gris con un borde duro, no como una tendencia.
        fillOpacity={0.16}
        gradientToOpacity={0}
        showLine
        showHighlight={false}
        showMarkers={false}
      />
    </AreaChart>
  );
}
