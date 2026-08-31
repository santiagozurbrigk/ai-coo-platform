"use client";

import type { ContentLabel } from "@/lib/content/label-content";
import { ChartShell, PieDistributionChart } from "@/components/charts/platform";
import type { PieData } from "@/components/charts/pie-context";
import { categoricalColor } from "@/lib/chart/colors";

const LABELS: ContentLabel[] = [
  "AUTORIDAD",
  "ATRACCION",
  "NUTRICION",
  "VENTA",
];

// Los cuatro tipos de contenido son categorías, no niveles: con la rampa
// monocroma NUTRICION y VENTA quedaban como dos grises casi idénticos.
const SLICE_COLORS: Record<ContentLabel, string> = {
  AUTORIDAD: categoricalColor(0),
  ATRACCION: categoricalColor(1),
  NUTRICION: categoricalColor(2),
  VENTA: categoricalColor(3),
};

type Props = {
  counts: Record<ContentLabel, number>;
  total: number;
  insight: string | null;
  hasContentAssets?: boolean;
};

export function ContentLabelDistributionChart({
  counts,
  total,
  insight,
  hasContentAssets,
}: Props) {
  if (total === 0 && hasContentAssets) {
    return (
      <ChartShell title="Distribución de contenido publicado">
        <p className="text-sm text-muted-foreground">
          Tenés contenido importado pero aún sin etiquetas. Asigná etiquetas en
          Marketing → Contenido para ver la distribución por tipo de pieza.
        </p>
      </ChartShell>
    );
  }

  if (total === 0) {
    return (
      <ChartShell title="Distribución de contenido publicado">
        <p className="text-sm text-muted-foreground">
          Sin contenido etiquetado todavía. Conectá YouTube o Instagram para ver
          la distribución por tipo.
        </p>
      </ChartShell>
    );
  }

  const slices: PieData[] = LABELS.filter((l) => counts[l] > 0).map((label) => ({
    label,
    value: counts[label],
    color: SLICE_COLORS[label],
  }));

  return (
    <ChartShell
      title="Distribución de contenido publicado"
      subtitle="Pie animado por etiqueta de contenido"
    >
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:items-center">
        <PieDistributionChart slices={slices} />
        <div className="space-y-2 text-xs">
          {LABELS.map((label) => {
            const count = counts[label];
            const pct = Math.round((count / total) * 100);
            return (
              <div key={label} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-medium">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: SLICE_COLORS[label] }}
                  />
                  {label}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {pct}% ({count})
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {insight ? (
        <div className="rounded-lg border border-border border-l-4 border-l-primary/60 bg-muted/20 px-4 py-3 text-sm leading-relaxed">
          {insight}
        </div>
      ) : null}
    </ChartShell>
  );
}
