"use client";

import type { ElementType, ReactNode } from "react";
import { cn, GlassPanel } from "@ai-coo/ui";
import { SparklineChart } from "@/components/charts/platform";
import { DeltaBadge } from "./delta-badge";
import { brandColors } from "@/lib/brand";

interface KpiHeroCardProps {
  label: string;
  value: string;
  hint?: string;
  /** Delta como texto (ej: "vs mes anterior") — usa DeltaBadge con flecha */
  delta?: number | null;
  deltaInverse?: boolean;
  /** Delta como porcentaje para badge pill compacto (ej: en grids de 6 cols) */
  trendPct?: number;
  /** Serie numérica para el sparkline al borde inferior. Mínimo 2 puntos. */
  sparkData?: number[];
  icon: ElementType;
  /** Slot de contenido adicional antes del sparkline (ej: tags de formato) */
  children?: ReactNode;
  className?: string;
}

/**
 * Tarjeta KPI de primer nivel — reutilizable en ventas y marketing.
 *
 * Dos modos de trend:
 * - `delta` → DeltaBadge con flecha y texto "vs mes anterior"
 * - `trendPct` → Pill compacto en la esquina superior derecha del header
 *
 * Sparkline: usa `aspectRatio="none"` para llenar el ancho completo del
 * contenedor de altura fija sin quedar restringido por la proporción SVG.
 */
export function KpiHeroCard({
  label,
  value,
  hint,
  delta,
  deltaInverse,
  trendPct,
  sparkData,
  icon: Icon,
  children,
  className,
}: KpiHeroCardProps) {
  const hasTrendPill = trendPct !== undefined;
  const pillPositive = hasTrendPill && trendPct > 0;
  const pillNegative = hasTrendPill && trendPct < 0;

  return (
    <GlassPanel className={cn("flex flex-col overflow-hidden p-0 min-h-[140px]", className)}>
      {/* ── Header ── */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/15 text-brand-500">
          <Icon size={15} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground leading-tight">
              {label}
            </p>
            {hasTrendPill && (
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold flex items-center gap-0.5",
                  pillPositive && "bg-emerald-500/15 text-emerald-500",
                  pillNegative && "bg-rose-500/15 text-rose-500",
                  !pillPositive && !pillNegative && "bg-muted text-muted-foreground"
                )}
              >
                {trendPct > 0 ? "↑" : trendPct < 0 ? "↓" : "~"}
                {Math.abs(trendPct)}%
              </span>
            )}
          </div>
          <p className="text-[2rem] font-bold tabular-nums leading-none tracking-tight">
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

      {/* ── Slot de contenido extra (ej: badges de formato) ── */}
      {children && <div className="px-4 pb-2">{children}</div>}

      {/* ── Sparkline pegado al borde inferior ── */}
      {sparkData && sparkData.length >= 2 ? (
        <div className="mt-auto h-14 w-full overflow-hidden">
          <SparklineChart
            data={sparkData}
            color={brandColors.primary}
            aspectRatio="none"
            className="h-14 w-full"
          />
        </div>
      ) : (
        <div className="mt-auto h-3" />
      )}
    </GlassPanel>
  );
}
