"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { cn } from "@ai-coo/ui";
import { deleteMetricSnapshotsByPeriodAction, getMetricSnapshotsAction, type MetricSnapshotRow, type SnapshotLocation } from "@/app/metrics/actions";
import { useToast } from "@/providers/toast-provider";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPeriod(period: string): string {
  const [year, month] = period.split("-");
  if (!year || !month) return period;
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("es-AR", { year: "numeric", month: "long" });
}

function formatValue(value: number): string {
  // Detectar si parece porcentaje (≤ 100 y tiene decimales)
  if (value > 0 && value <= 100 && !Number.isInteger(value)) {
    return `${value.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%`;
  }
  return value.toLocaleString("es-AR");
}

// Agrupar snapshots por período
function groupByPeriod(rows: MetricSnapshotRow[]): Map<string, MetricSnapshotRow[]> {
  const map = new Map<string, MetricSnapshotRow[]>();
  for (const row of rows) {
    const group = map.get(row.period) ?? [];
    group.push(row);
    map.set(row.period, group);
  }
  return map;
}

// ─── Fila de período ──────────────────────────────────────────────────────────

function PeriodRow({
  period,
  rows,
  location,
  onDeleted,
}: {
  period: string;
  rows: MetricSnapshotRow[];
  location?: SnapshotLocation;
  onDeleted: () => void;
}) {
  const { push } = useToast();
  const [expanded, setExpanded] = useState(true);
  const [deleting, startDelete] = useTransition();

  const handleDelete = () => {
    startDelete(async () => {
      const result = await deleteMetricSnapshotsByPeriodAction(period, location);
      if ("error" in result && result.error) {
        push({ title: "Error al eliminar", description: result.error, variant: "default" });
      } else {
        push({ title: `Datos de ${formatPeriod(period)} eliminados`, variant: "success" });
        onDeleted();
      }
    });
  };

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      {/* Header del período */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2">
          {expanded
            ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          }
          <span className="text-sm font-medium capitalize">{formatPeriod(period)}</span>
          <span className="text-xs text-muted-foreground">({rows.length} métricas)</span>
        </div>
        <button
          type="button"
          disabled={deleting}
          onClick={(e) => { e.stopPropagation(); handleDelete(); }}
          className="flex h-6 w-6 items-center justify-center rounded-md border border-border/60 bg-background text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
          title="Eliminar período"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Métricas del período */}
      {expanded && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-border/30">
          {rows.map((row) => (
            <div key={row.id} className="bg-background px-4 py-3">
              <p className="text-xs text-muted-foreground truncate">{row.metric_key}</p>
              <p className="text-lg font-semibold tabular-nums tracking-tight mt-0.5">
                {formatValue(Number(row.value))}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sección principal ────────────────────────────────────────────────────────

export function MetricSnapshotsSection({
  initialRows,
  location,
  onImported,
}: {
  initialRows: MetricSnapshotRow[];
  location?: SnapshotLocation;
  onImported?: () => void;
}) {
  const [rows, setRows] = useState<MetricSnapshotRow[]>(initialRows);

  async function refresh() {
    const updated = await getMetricSnapshotsAction(location);
    setRows(updated);
    onImported?.();
  }

  const grouped = groupByPeriod(rows);
  const periods = [...grouped.keys()];

  if (periods.length === 0) return null;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">Historial importado</p>
        <p className="text-xs text-muted-foreground">
          Métricas cargadas desde Excel organizadas por período
        </p>
      </div>

      <div className="space-y-2">
        {periods.map((period) => (
          <PeriodRow
            key={period}
            period={period}
            rows={grouped.get(period)!}
            location={location}
            onDeleted={refresh}
          />
        ))}
      </div>
    </div>
  );
}
