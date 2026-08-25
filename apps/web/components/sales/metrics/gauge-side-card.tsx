"use client";

import { GlassPanel } from "@ai-coo/ui";
import { GaugeMetricChart } from "@/components/charts/platform";

interface GaugeSideCardProps {
  label: string;
  /** Valor 0–100 para el gauge */
  value: number;
  /** Texto a mostrar como número (si difiere de `value%`) */
  displayValue?: string;
  suffix?: string;
}

/**
 * Tarjeta de gauge para el sidebar lateral.
 * Número grande en el header, arco visual grande abajo sin texto interno.
 */
export function GaugeSideCard({
  label,
  value,
  displayValue,
  suffix = "%",
}: GaugeSideCardProps) {
  return (
    <GlassPanel className="overflow-hidden p-0">
      <div className="px-4 pt-3 pb-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-2xl font-bold tabular-nums">
          {displayValue ?? `${Math.round(value)}${suffix}`}
        </p>
      </div>
      <div className="flex justify-center px-2 pb-2">
        <GaugeMetricChart
          value={value}
          max={100}
          label=""
          suffix={suffix}
          className="w-full max-w-[200px]"
          valueClassName="hidden"
          labelClassName="hidden"
        />
      </div>
    </GlassPanel>
  );
}
