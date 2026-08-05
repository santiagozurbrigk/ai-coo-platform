"use client";

import { useState, useTransition } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  cn,
} from "@ai-coo/ui";
import {
  METRIC_DISPLAY_FORMATS,
  METRIC_OPERATIONS,
  METRIC_SOURCES,
  applyOperation,
  formatMetricValue,
  type ComputedCustomMetric,
  type MetricDisplayFormat,
  type MetricOperation,
  type MetricSource,
} from "@/lib/metrics/custom-metrics";
import {
  createCustomMetricAction,
  updateCustomMetricAction,
  type CreateCustomMetricInput,
} from "@/app/metrics/actions";

// ─── Grouped source selector ──────────────────────────────────────────────────

const GROUPS = Array.from(new Set(METRIC_SOURCES.map((s) => s.group)));

function SourceSelect({
  label,
  value,
  onChange,
  placeholder = "Seleccioná una fuente",
}: {
  label: string;
  value: MetricSource | "";
  onChange: (v: MetricSource) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as MetricSource)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <option value="">{placeholder}</option>
        {GROUPS.map((group) => (
          <optgroup key={group} label={group}>
            {METRIC_SOURCES.filter((s) => s.group === group).map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

// ─── Preview ──────────────────────────────────────────────────────────────────

function MetricPreview({
  value,
  format,
  name,
}: {
  value: number | null;
  format: MetricDisplayFormat;
  name: string;
}) {
  const display =
    value !== null ? formatMetricValue(value, format) : "—";

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
        Vista previa
      </p>
      <p className="text-2xl font-semibold tabular-nums text-primary">{display}</p>
      {name && (
        <p className="text-xs text-muted-foreground mt-0.5">{name}</p>
      )}
    </div>
  );
}

// ─── Main builder ─────────────────────────────────────────────────────────────

type BuilderState = {
  name: string;
  description: string;
  source_a: MetricSource | "";
  operation: MetricOperation;
  source_b: MetricSource | "";
  constant_b: string;
  useConstant: boolean;
  display_format: MetricDisplayFormat;
};

function initState(metric?: ComputedCustomMetric): BuilderState {
  if (!metric) {
    return {
      name: "",
      description: "",
      source_a: "",
      operation: "none",
      source_b: "",
      constant_b: "",
      useConstant: false,
      display_format: "number",
    };
  }
  return {
    name: metric.name,
    description: metric.description ?? "",
    source_a: metric.source_a,
    operation: metric.operation,
    source_b: metric.source_b ?? "",
    constant_b: metric.constant_b != null ? String(metric.constant_b) : "",
    useConstant: metric.source_b == null && metric.constant_b != null,
    display_format: metric.display_format,
  };
}

export function CustomMetricBuilder({
  open,
  onOpenChange,
  editing,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing?: ComputedCustomMetric;
  onSaved: () => void;
}) {
  const [state, setState] = useState<BuilderState>(() => initState(editing));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Reset when dialog opens with different editing target
  const handleOpenChange = (v: boolean) => {
    if (v) setState(initState(editing));
    setError(null);
    onOpenChange(v);
  };

  function set<K extends keyof BuilderState>(k: K, v: BuilderState[K]) {
    setState((prev) => ({ ...prev, [k]: v }));
  }

  const hasOperation = state.operation !== "none";

  // Preview value (uses constants only — server sources show — until saved)
  const previewValue: number | null = (() => {
    if (!hasOperation) return null; // can't preview without real DB
    if (state.useConstant && state.constant_b !== "") {
      const cb = parseFloat(state.constant_b);
      if (!isNaN(cb)) return applyOperation(1, state.operation, cb); // placeholder base=1
    }
    return null;
  })();

  function validate(): string | null {
    if (!state.name.trim()) return "El nombre es obligatorio";
    if (!state.source_a) return "Seleccioná la fuente principal";
    if (hasOperation) {
      if (!state.useConstant && !state.source_b) return "Seleccioná la segunda fuente";
      if (state.useConstant && state.constant_b === "") return "Ingresá la constante";
      if (state.useConstant && isNaN(parseFloat(state.constant_b))) {
        return "La constante debe ser un número";
      }
    }
    return null;
  }

  function buildInput(): CreateCustomMetricInput {
    return {
      name: state.name,
      description: state.description || undefined,
      source_a: state.source_a as MetricSource,
      operation: state.operation,
      source_b: hasOperation && !state.useConstant && state.source_b
        ? (state.source_b as MetricSource)
        : undefined,
      constant_b: hasOperation && state.useConstant && state.constant_b !== ""
        ? parseFloat(state.constant_b)
        : undefined,
      display_format: state.display_format,
    };
  }

  function handleSave() {
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);

    startTransition(async () => {
      const input = buildInput();
      const res = editing
        ? await updateCustomMetricAction(editing.id, input)
        : await createCustomMetricAction(input);

      if (!res.success) {
        setError(res.error);
        return;
      }
      onSaved();
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar métrica" : "Nueva métrica personalizada"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Name + Description */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Nombre *
            </label>
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Ej: Revenue del CSM, Tasa de cierre, Upsells del mes"
              value={state.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Descripción (opcional)
            </label>
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Para qué sirve esta métrica"
              value={state.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          {/* Source A */}
          <SourceSelect
            label="Fuente de datos *"
            value={state.source_a}
            onChange={(v) => set("source_a", v)}
          />

          {/* Operation */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Operación con otra fuente
            </label>
            <select
              value={state.operation}
              onChange={(e) => set("operation", e.target.value as MetricOperation)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {METRIC_OPERATIONS.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>
          </div>

          {/* Source B or Constant B */}
          {hasOperation && (
            <div className="space-y-3 rounded-xl border border-border/50 bg-muted/20 p-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => set("useConstant", false)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    !state.useConstant
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  )}
                >
                  Otra fuente de datos
                </button>
                <button
                  type="button"
                  onClick={() => set("useConstant", true)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    state.useConstant
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  )}
                >
                  Constante (número fijo)
                </button>
              </div>

              {state.useConstant ? (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Valor constante (ej: 0.20 para 20%)
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Ej: 0.20"
                    value={state.constant_b}
                    onChange={(e) => set("constant_b", e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Tip: para calcular el 20% de algo, ingresá 0.20 y elegí Multiplicar
                  </p>
                </div>
              ) : (
                <SourceSelect
                  label="Segunda fuente *"
                  value={state.source_b}
                  onChange={(v) => set("source_b", v)}
                  placeholder="Seleccioná la segunda fuente"
                />
              )}
            </div>
          )}

          {/* Display format */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Formato de visualización
            </label>
            <div className="flex flex-wrap gap-2">
              {METRIC_DISPLAY_FORMATS.map((fmt) => (
                <button
                  key={fmt.value}
                  type="button"
                  onClick={() => set("display_format", fmt.value as MetricDisplayFormat)}
                  className={cn(
                    "rounded-lg border px-3 py-1 text-xs font-medium transition-colors",
                    state.display_format === fmt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  )}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview (only meaningful with constants) */}
          {previewValue !== null && (
            <MetricPreview
              value={previewValue}
              format={state.display_format}
              name={state.name}
            />
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            className="w-full"
            disabled={pending}
            onClick={handleSave}
          >
            {pending
              ? "Guardando…"
              : editing
              ? "Guardar cambios"
              : "Crear métrica"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
