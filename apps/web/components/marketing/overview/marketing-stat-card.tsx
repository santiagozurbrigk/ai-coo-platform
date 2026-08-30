"use client";

import type { ElementType } from "react";
import { cn, GlassPanel } from "@ai-coo/ui";

interface MarketingStatCardProps {
  label: string;
  value: string;
  sub?: string;
  /** Delta porcentual, ej: +4 o -12 */
  trendPct?: number;
  icon?: ElementType;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Tarjeta de métrica compacta para el módulo de marketing.
 * Reutiliza el mismo estilo que StatCard de ventas.
 */
export function MarketingStatCard({
  label,
  value,
  sub,
  trendPct,
  icon: Icon,
  children,
  className,
}: MarketingStatCardProps) {
  const isPositive = trendPct !== undefined && trendPct > 0;
  const isNegative = trendPct !== undefined && trendPct < 0;

  return (
    <GlassPanel className={cn("flex flex-col gap-2 p-4", className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] leading-tight text-muted-foreground">{label}</p>
        {Icon && (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-500/15 text-brand-500">
            <Icon size={12} />
          </div>
        )}
        {trendPct !== undefined && (
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
              isPositive && "bg-emerald-500/15 text-emerald-500",
              isNegative && "bg-rose-500/15 text-rose-500",
              !isPositive && !isNegative && "bg-muted text-muted-foreground"
            )}
          >
            {trendPct > 0 ? "+" : ""}{trendPct}%
          </span>
        )}
      </div>
      <p className="text-[2rem] font-bold tabular-nums leading-none">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
      {children}
    </GlassPanel>
  );
}
