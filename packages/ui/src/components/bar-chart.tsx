"use client";

import { cn } from "../lib/utils";

export type BarChartDatum = {
  label: string;
  value: number;
  color?: string;
};

export interface BarChartProps {
  data: BarChartDatum[];
  maxValue?: number;
  height?: number;
  className?: string;
  showLabels?: boolean;
}

export function BarChart({
  data,
  maxValue,
  height = 160,
  className,
  showLabels = true,
}: BarChartProps) {
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={cn("w-full", className)}>
      <div
        className="flex items-end gap-2 sm:gap-3"
        style={{ height }}
        role="img"
        aria-label="Gráfico de barras"
      >
        {data.map((datum, i) => {
          const pct = (datum.value / max) * 100;
          return (
            <div
              key={datum.label}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div
                className="relative w-full flex-1 flex items-end justify-center"
              >
                <div
                  className={cn(
                    "w-full max-w-[48px] rounded-t-md transition-all duration-500",
                    datum.color ?? "bg-primary/80"
                  )}
                  style={{
                    height: `${pct}%`,
                    minHeight: datum.value > 0 ? "4px" : 0,
                    animationDelay: `${i * 50}ms`,
                  }}
                />
              </div>
              {showLabels && (
                <span className="text-2xs text-muted-foreground truncate max-w-full text-center">
                  {datum.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
