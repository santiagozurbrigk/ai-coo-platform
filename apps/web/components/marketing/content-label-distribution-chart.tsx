"use client";

import type { ContentLabel } from "@/lib/content/label-content";

const LABELS: ContentLabel[] = [
  "AUTORIDAD",
  "ATRACCION",
  "NUTRICION",
  "VENTA",
];

const BAR_COLORS: Record<ContentLabel, string> = {
  AUTORIDAD: "bg-violet-500",
  ATRACCION: "bg-pink-500",
  NUTRICION: "bg-emerald-500",
  VENTA: "bg-amber-500",
};

type Props = {
  counts: Record<ContentLabel, number>;
  total: number;
  insight: string | null;
};

export function ContentLabelDistributionChart({
  counts,
  total,
  insight,
}: Props) {
  if (total === 0) {
    return (
      <section className="rounded-xl border border-border/60 p-6">
        <h3 className="text-sm font-semibold">
          Distribución de contenido publicado
        </h3>
        <p className="mt-4 text-sm text-muted-foreground">
          Sin contenido etiquetado todavía. Conectá YouTube o Instagram para ver
          la distribución por tipo.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border/60 p-6 space-y-4">
      <h3 className="text-sm font-semibold">
        Distribución de contenido publicado
      </h3>
      <div className="space-y-3">
        {LABELS.map((label) => {
          const count = counts[label];
          const pct = Math.round((count / total) * 100);
          return (
            <div key={label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{label}</span>
                <span className="text-muted-foreground tabular-nums">
                  {pct}% ({count} {count === 1 ? "pieza" : "piezas"})
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${BAR_COLORS[label]}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {insight && (
        <div className="rounded-lg border border-border border-l-4 border-l-primary/60 bg-muted/20 px-4 py-3 text-sm leading-relaxed">
          {insight}
        </div>
      )}
    </section>
  );
}
