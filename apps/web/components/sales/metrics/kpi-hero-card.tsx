"use client";

import type { ElementType } from "react";
import { GlassPanel } from "@ai-coo/ui";
import { SparklineChart } from "@/components/charts/platform";
import { DeltaBadge } from "./delta-badge";

interface KpiHeroCardProps {
  label: string;
  value: string;
  hint?: string;
  delta?: number | null;
  deltaInverse?: boolean;
  /** Serie numérica para el sparkline al borde inferior. Mínimo 2 puntos. */
  sparkData?: number[];
  icon: ElementType;
}

/**
 * Tarjeta KPI de primer nivel.
 * Layout: icono + label + número + hint arriba; sparkline violeta pegado al borde inferior.
 * Usa SparklineChart (sin min-height constraints) para respetar la altura fija de la card.
 */
export function KpiHeroCard({
  label,
  value,
  hint,
  delta,
  deltaInverse,
  sparkData,
  icon: Icon,
}: KpiHeroCardProps) {
  return (
    <GlassPanel className="flex flex-col overflow-hidden p-0 min-h-[140px]">
      <div className="flex items-start gap-3 px-5 pt-5 pb-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-500">
          <Icon size={15} />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="text-[2.2rem] font-bold tabular-nums leading-none tracking-tight">
            {value}
          </p>
          {hint && (
            <p className="text-[11px] text-muted-foreground">{hint}</p>
          )}
          {delta !== undefined && delta !== null && (
            <DeltaBadge delta={delta} inverse={deltaInverse} />
          )}
        </div>
      </div>

      {sparkData && sparkData.length >= 2 ? (
        <div className="mt-auto h-16 w-full overflow-hidden">
          {/* aspectRatio="none" permite que el SVG llene el ancho completo del
              contenedor de altura fija sin quedar restringido por la proporción */}
          <SparklineChart
            data={sparkData}
            color="#7C3AED"
            aspectRatio="none"
            className="h-16 w-full"
          />
        </div>
      ) : (
        <div className="h-4" />
      )}
    </GlassPanel>
  );
}
