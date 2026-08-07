"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@ai-coo/ui";

interface DeltaBadgeProps {
  /** Cambio porcentual respecto al período anterior */
  delta: number | null;
  /** Si true, un delta negativo se considera positivo (ej. tasa de fantasma) */
  inverse?: boolean;
}

/** Badge de variación vs período anterior. Null o variación < 0.5% → "Sin cambio". */
export function DeltaBadge({ delta, inverse = false }: DeltaBadgeProps) {
  if (delta === null) return null;
  const abs = Math.abs(delta);
  if (abs < 0.5)
    return (
      <span className="text-[10px] text-muted-foreground">Sin cambio</span>
    );
  const isPositive = inverse ? delta < 0 : delta > 0;
  const Icon = delta > 0 ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "flex items-center gap-0.5 text-[11px] font-medium",
        isPositive ? "text-emerald-500" : "text-rose-500"
      )}
    >
      <Icon size={11} />
      {abs.toFixed(1)}% vs mes anterior
    </span>
  );
}
