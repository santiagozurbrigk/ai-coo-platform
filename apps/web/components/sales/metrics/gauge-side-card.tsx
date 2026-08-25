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
 * Label arriba, gauge centrado con el número adentro, objetivo abajo.
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
      <div className="px-4 pt-3 pb-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-lg font-bold tabular-nums">
          {displayValue ?? `${Math.round(value)}${suffix}`}
        </p>
      </div>
      <div className="flex justify-center px-4 pt-0 pb-1">
        <GaugeMetricChart
          value={value}
          max={100}
          label=""
          suffix={suffix}
          className="w-full max-w-[140px]"
        />
      </div>
      <p className="pb-3 text-center text-[11px] text-muted-foreground">{target}</p>
    </GlassPanel>
  );
}
