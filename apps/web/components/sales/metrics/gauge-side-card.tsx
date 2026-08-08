"use client";

import { GlassPanel } from "@ai-coo/ui";
import { GaugeMetricChart } from "@/components/charts/platform";

interface GaugeSideCardProps {
  label: string;
  /** Valor 0–100 para el gauge */
  value: number;
  /** Texto a mostrar como número (si difiere de `value%`) */
  displayValue?: string;
  /** Texto de objetivo bajo el número */
  target: string;
  suffix?: string;
}

/**
 * Tarjeta de gauge para el sidebar lateral.
 * Texto arriba con label + número, gauge centrado abajo.
 */
export function GaugeSideCard({
  label,
  value,
  displayValue,
  target,
  suffix = "%",
}: GaugeSideCardProps) {
  return (
    <GlassPanel className="overflow-hidden p-0">
      <div className="px-4 pt-4 pb-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-2xl font-bold tabular-nums">
          {displayValue ?? `${Math.round(value)}${suffix}`}
        </p>
        <p className="text-[11px] text-muted-foreground">{target}</p>
      </div>
      <div className="flex justify-center px-4 pb-3">
        <GaugeMetricChart
          value={value}
          max={100}
          label={label}
          suffix={suffix}
          className="w-full max-w-[180px]"
        />
      </div>
    </GlassPanel>
  );
}
