"use client";

import { useState, useTransition } from "react";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { cn } from "@ai-coo/ui";
import type { ComputedCustomMetric } from "@/lib/metrics/custom-metrics";
import { deleteCustomMetricAction } from "@/app/metrics/actions";
import { CustomMetricBuilder } from "./custom-metric-builder";

// ─── Individual card ──────────────────────────────────────────────────────────

function CustomMetricCard({
  metric,
  onEdit,
  onDelete,
}: {
  metric: ComputedCustomMetric;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [deletePending, startDelete] = useTransition();

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/50 bg-card px-4 py-4 transition-all",
        "dark:border-glass dark:bg-glass dark:backdrop-blur-md",
        "hover:border-primary/30 hover:shadow-sm"
      )}
    >
      {/* Action buttons — appear on hover */}
      <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={onEdit}
          className="flex h-6 w-6 items-center justify-center rounded-md border border-border/60 bg-background text-muted-foreground hover:text-foreground transition-colors"
          title="Editar"
        >
          <Edit2 className="h-3 w-3" />
        </button>
        <button
          type="button"
          disabled={deletePending}
          onClick={() => {
            startDelete(async () => {
              await deleteCustomMetricAction(metric.id);
              onDelete();
            });
          }}
          className="flex h-6 w-6 items-center justify-center rounded-md border border-border/60 bg-background text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
          title="Eliminar"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Value */}
      <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground pr-14">
        {metric.formatted_value}
      </p>

      {/* Name */}
      <p className="mt-1 text-sm font-medium text-foreground/80 leading-snug pr-14">
        {metric.name}
      </p>

      {/* Description */}
      {metric.description && (
        <p className="mt-1 text-xs text-muted-foreground leading-snug">
          {metric.description}
        </p>
      )}
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

export function CustomMetricsSection({
  initialMetrics,
}: {
  initialMetrics: ComputedCustomMetric[];
}) {
  const [metrics, setMetrics] = useState<ComputedCustomMetric[]>(initialMetrics);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<ComputedCustomMetric | undefined>();

  function openCreate() {
    setEditingMetric(undefined);
    setBuilderOpen(true);
  }

  function openEdit(metric: ComputedCustomMetric) {
    setEditingMetric(metric);
    setBuilderOpen(true);
  }

  async function handleSaved() {
    // Refetch from server after save
    const { getCustomMetricsAction } = await import("@/app/metrics/actions");
    const updated = await getCustomMetricsAction();
    setMetrics(updated);
  }

  function handleDeleted(id: string) {
    setMetrics((prev) => prev.filter((m) => m.id !== id));
  }

  const isEmpty = metrics.length === 0;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Mis métricas</p>
          <p className="text-xs text-muted-foreground">
            KPIs personalizados para tu negocio
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Nueva métrica
        </button>
      </div>

      {/* Grid */}
      {isEmpty ? (
        <button
          type="button"
          onClick={openCreate}
          className={cn(
            "w-full rounded-xl border-2 border-dashed border-border/50 bg-muted/10 px-4 py-8 text-center transition-colors",
            "hover:border-primary/30 hover:bg-primary/5"
          )}
        >
          <Plus className="mx-auto h-6 w-6 text-muted-foreground/50" />
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Creá tu primera métrica personalizada
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground/70">
            Combiná datos de clientes, ventas, closing y marketing
          </p>
        </button>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {metrics.map((metric) => (
            <CustomMetricCard
              key={metric.id}
              metric={metric}
              onEdit={() => openEdit(metric)}
              onDelete={() => handleDeleted(metric.id)}
            />
          ))}
        </div>
      )}

      {/* Builder modal */}
      <CustomMetricBuilder
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        editing={editingMetric}
        onSaved={handleSaved}
      />
    </div>
  );
}
