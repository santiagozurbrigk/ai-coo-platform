"use client";

import type { ElementType } from "react";
import { cn, GlassPanel } from "@ai-coo/ui";
import { DeltaBadge } from "./delta-badge";

interface StatCardProps {
  label: string;
  value: number | string;
  suffix?: string;
  delta?: number | null;
  deltaInverse?: boolean;
  icon?: ElementType;
  /** Aplica opacidad reducida cuando el dato no está disponible o es cero */
  dimmed?: boolean;
}

/**
 * Tarjeta de métrica compacta con icono violeta.
 * Número en text-[2rem] para máxima legibilidad.
 */
export function StatCard({
  label,
  value,
  suffix = "",
  delta,
  deltaInverse,
  icon: Icon,
  dimmed = false,
}: StatCardProps) {
  return (
    <GlassPanel className={cn("flex flex-col gap-2 p-4", dimmed && "opacity-40")}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] leading-tight text-muted-foreground">{label}</p>
        {Icon && (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-500/15 text-brand-500">
            <Icon size={12} />
          </div>
        )}
      </div>
      <p className="text-[2rem] font-bold tabular-nums leading-none">
        {value}
        {suffix}
      </p>
      {delta !== undefined && delta !== null && (
        <DeltaBadge delta={delta} inverse={deltaInverse} />
      )}
    </GlassPanel>
  );
}
