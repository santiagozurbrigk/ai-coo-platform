"use client";

import { BarChart, Bar } from "@/components/charts/bar-chart";
import { Grid } from "@/components/charts/grid";
import { BarXAxis } from "@/components/charts/bar-x-axis";
import { ChartTooltip } from "@/components/charts/tooltip";
import { categoricalColor } from "@/lib/chart/colors";
import { cn } from "@/lib/utils";
import { ChartLegend } from "./chart-legend";
import { ChartWrapper, CHART_MIN_HEIGHT } from "./chart-wrapper";

export function StackedBarChart({
  data,
  keys,
  labels,
  className,
  minHeight,
  yDomainPadding,
}: {
  data: { month: string; [key: string]: string | number }[];
  keys: string[];
  labels: string[];
  className?: string;
  minHeight?: string;
  /** Multiplier for Y max (default 1.1). Use 1.3 for sparse monthly data. */
  yDomainPadding?: number;
}) {
  const rows = data.map((d) => ({ name: d.month, ...d }));

  return (
    <div className={cn("w-full space-y-3", className)}>
      <ChartWrapper
        data={rows}
        minPoints={1}
        emptyMessage="Sin datos de facturación por mes"
        minHeight={minHeight ?? CHART_MIN_HEIGHT.md}
        className="w-full"
      >
      <BarChart
        data={rows}
        xDataKey="name"
        stacked
        yDomainPadding={yDomainPadding}
        aspectRatio={data.length <= 2 ? "4 / 1" : "2.2 / 1"}
        barWidth={data.length <= 2 ? 48 : undefined}
        barGap={0.55}
        className="w-full"
        animationDuration={1000}
        margin={{ top: 20, right: 12, bottom: 36, left: 8 }}
      >
        <Grid horizontal vertical={false} numTicksRows={4} />
        {keys.map((key, i) => (
          // `stackGap` separa los segmentos con la superficie de la card en vez
          // de dibujarles un borde alrededor. `lineCap` fijo y chico: con el
          // redondeo automático ("round" = hasta 8px) cada segmento quedaba
          // como una píldora suelta y la pila dejaba de leerse como una columna.
          <Bar
            key={key}
            dataKey={key}
            fill={categoricalColor(i)}
            stroke={categoricalColor(i)}
            lineCap={3}
            stackGap={2}
          />
        ))}
        <BarXAxis showAllLabels />
        <ChartTooltip />
      </BarChart>
      </ChartWrapper>
      <ChartLegend
        items={labels.map((label, i) => ({
          label,
          color: categoricalColor(i),
        }))}
      />
    </div>
  );
}
