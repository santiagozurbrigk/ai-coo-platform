"use client";

import { AreaChart, Area } from "@/components/charts/area-chart";
import { Grid } from "@/components/charts/grid";
import { XAxis } from "@/components/charts/x-axis";
import { ChartTooltip } from "@/components/charts/tooltip";
import { categoricalColor } from "@/lib/chart/colors";
import { cn } from "@/lib/utils";
import { ChartLegend } from "./chart-legend";

export function DualAreaChart({
  data,
  primaryKey,
  secondaryKey,
  primaryLabel,
  secondaryLabel,
  className,
  aspectRatio = "2.2 / 1",
}: {
  data: { label: string; primary: number; secondary: number }[];
  primaryKey: string;
  secondaryKey: string;
  primaryLabel: string;
  secondaryLabel: string;
  className?: string;
  /** SVG aspect ratio. Pasá "none" para llenar un contenedor de altura fija. */
  aspectRatio?: string;
}) {
  const rows = data.map((d, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (data.length - 1 - i));
    return {
      date,
      name: d.label,
      [primaryKey]: d.primary,
      [secondaryKey]: d.secondary,
    };
  });

  // Dos series son dos identidades: van a dos colores de la paleta categórica.
  // Dos opacidades del mismo tono se leen como una sola serie con sombra.
  const primaryColor = categoricalColor(0);
  const secondaryColor = categoricalColor(1);

  return (
    <div className={cn("w-full space-y-3", className)}>
      <AreaChart
        data={rows}
        xDataKey="date"
        aspectRatio={aspectRatio}
        className="w-full"
        animationDuration={1000}
        // Canaleta suficiente para que la primera y la última etiqueta del
        // eje X no queden pisando el borde de la card.
        margin={{ top: 20, right: 20, bottom: 32, left: 20 }}
      >
        <Grid horizontal vertical={false} numTicksRows={4} />
        <Area
          dataKey={primaryKey}
          fill={primaryColor}
          stroke={primaryColor}
          fillOpacity={0.22}
        />
        <Area
          dataKey={secondaryKey}
          fill={secondaryColor}
          stroke={secondaryColor}
          fillOpacity={0.22}
        />
        <XAxis numTicks={Math.min(data.length, 6)} />
        <ChartTooltip />
      </AreaChart>
      <ChartLegend
        items={[
          { label: primaryLabel, color: primaryColor },
          { label: secondaryLabel, color: secondaryColor },
        ]}
      />
    </div>
  );
}
