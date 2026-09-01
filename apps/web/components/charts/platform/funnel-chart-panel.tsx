"use client";

import type { CSSProperties } from "react";
import {
  FunnelChart,
  type FunnelStage,
} from "@/components/charts/funnel-chart";
import { ordinalColor } from "@/lib/chart/colors";
import { cn } from "@/lib/utils";

export function FunnelChartPanel({
  stages,
  className,
  /**
   * Color único para todas las etapas. Por defecto no se pasa: las etapas de un
   * embudo son **ordinales** (cambiar el orden cambia el significado), así que
   * cada una toma su paso de la rampa naranja y el orden se lee en el color.
   */
  color,
  style,
  orientation = "vertical",
}: {
  stages: FunnelStage[];
  className?: string;
  color?: string;
  style?: CSSProperties;
  orientation?: "horizontal" | "vertical";
}) {
  const horizontal = orientation === "horizontal";

  const rampedStages = stages.map((stage, i) => ({
    ...stage,
    color: stage.color ?? color ?? ordinalColor(i, stages.length),
  }));

  return (
    // El chart mide su propio contenedor y posiciona las etiquetas de etapa en
    // `absolute inset-0`, que ignora el padding del propio elemento: la canaleta
    // tiene que ir en un wrapper, si no la etiqueta de la primera y la última
    // etapa se cortan contra el borde de la card.
    <div className={cn("w-full px-3", horizontal ? "sm:px-5" : undefined)}>
    <FunnelChart
      data={rampedStages}
      orientation={orientation}
      showLabels
      showValues
      showPercentage
      edges="curved"
      layers={3}
      gap={6}
      className={cn(
        "w-full",
        horizontal ? "min-h-[280px]" : "min-h-[400px]",
        className
      )}
      style={{
        ...(horizontal
          ? { minHeight: 280, aspectRatio: "2.4 / 1", width: "100%" }
          : { minHeight: 400, height: 400, aspectRatio: "auto" }),
        ...style,
      }}
      formatValue={(v) => v.toLocaleString("es-ES")}
      formatPercentage={(p) => `${Math.round(p)}%`}
    />
    </div>
  );
}
