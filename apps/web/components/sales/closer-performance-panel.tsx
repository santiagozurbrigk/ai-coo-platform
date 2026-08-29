"use client";

import { GlassPanel } from "@ai-coo/ui";
import { formatMoney } from "@/lib/finance/format";
import type { CloserPerformance } from "@/types/finance";

export function CloserPerformancePanel({
  closers,
}: {
  closers: CloserPerformance[];
}) {
  if (closers.length <= 1) return null;

  const max = Math.max(...closers.map((c) => c.revenue));

  return (
    <GlassPanel className="p-5 space-y-4">
      <div>
        <h3 className="text-sm font-medium">Rendimiento por closer</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Deals cerrados e ingresos atribuidos · ordenado por ingresos
        </p>
      </div>
      <div className="space-y-4">
        {closers.map((c) => {
          const initials = c.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2);
          const pct = (c.revenue / max) * 100;
          return (
            <div key={c.id} className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-2 text-sm mb-1">
                  <span className="font-medium truncate">{c.name}</span>
                  <span className="text-muted-foreground tabular-nums shrink-0">
                    {formatMoney(c.revenue)} · {c.dealsClosed} deals
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light shadow-[0_0_12px_rgba(225,93,18,0.5)]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Comisión estimada: {formatMoney(c.commission)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
}
