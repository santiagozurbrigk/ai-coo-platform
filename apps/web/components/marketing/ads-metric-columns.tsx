"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Columns3, X } from "lucide-react";
import {
  formatActionKey,
  formatCurrency,
  formatMultiplier,
  formatNumber,
  formatPercent,
  formatSeconds,
} from "@/lib/utils/format-ad-metrics";
import { cn } from "@ai-coo/ui";

// ─── Metric keys ────────────────────────────────────────────────────────────

export type MetricKey =
  | "spend" | "impressions" | "reach" | "clicks" | "ctr" | "cpc" | "cpm"
  | "engagement" | "conversions" | "costPerConversion" | "purchaseValue" | "roas"
  | "videoPlayActions" | "video30SecWatchedActions" | "videoThruplayWatchedActions"
  | "videoAvgTimeWatchedActions" | "videoP25WatchedActions" | "videoP50WatchedActions"
  | "videoP75WatchedActions" | "videoP100WatchedActions";

/** Clave dinámica para eventos de Meta (actions / actionValues de Zernio) */
export type DynamicMetricKey = `action:${string}` | `actionValue:${string}`;
export type AnyMetricKey = MetricKey | DynamicMetricKey;

export type MetricDef = {
  key: AnyMetricKey;
  label: string;
  shortLabel: string;
  category: "Performance" | "Conversiones" | "Video" | "Eventos";
  format: (v: number) => string;
  sortable: boolean;
  colorFn?: (v: number) => string;
  defaultSelected: boolean;
  isDynamic?: boolean;
};

// ─── Color helpers ───────────────────────────────────────────────────────────

export function roasColorClass(roas: number): string {
  if (roas <= 0) return "text-muted-foreground";
  if (roas >= 2) return "text-emerald-600 dark:text-emerald-400 font-semibold";
  if (roas >= 1) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export function ctrColorClass(ctr: number): string {
  if (ctr <= 0) return "text-muted-foreground";
  if (ctr >= 2) return "text-emerald-600 dark:text-emerald-400 font-semibold";
  if (ctr >= 1) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

// ─── All metric definitions ─────────────────────────────────────────────────

export const ALL_METRIC_DEFS: MetricDef[] = [
  // Performance
  { key: "spend",       label: "Gasto",              shortLabel: "Gasto",      category: "Performance",  format: formatCurrency,   sortable: true,  colorFn: undefined,       defaultSelected: true  },
  { key: "impressions", label: "Impresiones",         shortLabel: "Impres.",    category: "Performance",  format: formatNumber,     sortable: true,  colorFn: undefined,       defaultSelected: true  },
  { key: "reach",       label: "Alcance",             shortLabel: "Alcance",    category: "Performance",  format: formatNumber,     sortable: false, colorFn: undefined,       defaultSelected: true  },
  { key: "clicks",      label: "Clics",               shortLabel: "Clics",      category: "Performance",  format: formatNumber,     sortable: true,  colorFn: undefined,       defaultSelected: false },
  { key: "ctr",         label: "CTR",                 shortLabel: "CTR",        category: "Performance",  format: formatPercent,    sortable: true,  colorFn: ctrColorClass,   defaultSelected: true  },
  { key: "cpc",         label: "CPC",                 shortLabel: "CPC",        category: "Performance",  format: formatCurrency,   sortable: false, colorFn: undefined,       defaultSelected: false },
  { key: "cpm",         label: "CPM",                 shortLabel: "CPM",        category: "Performance",  format: formatCurrency,   sortable: false, colorFn: undefined,       defaultSelected: false },
  { key: "engagement",  label: "Engagement",          shortLabel: "Engag.",     category: "Performance",  format: formatNumber,     sortable: false, colorFn: undefined,       defaultSelected: false },
  // Conversiones
  { key: "roas",              label: "ROAS",                    shortLabel: "ROAS",       category: "Conversiones", format: formatMultiplier, sortable: true,  colorFn: roasColorClass,  defaultSelected: true  },
  { key: "conversions",       label: "Conversiones",            shortLabel: "Conv.",      category: "Conversiones", format: formatNumber,     sortable: true,  colorFn: undefined,       defaultSelected: true  },
  { key: "costPerConversion", label: "Costo por conversión",    shortLabel: "CPA",        category: "Conversiones", format: formatCurrency,   sortable: false, colorFn: undefined,       defaultSelected: false },
  { key: "purchaseValue",     label: "Valor de compras",        shortLabel: "Val. compras", category: "Conversiones", format: formatCurrency, sortable: false, colorFn: undefined,       defaultSelected: false },
  // Video
  { key: "videoPlayActions",           label: "Reproducciones de video", shortLabel: "Reprod.",    category: "Video", format: formatNumber,  sortable: false, defaultSelected: false },
  { key: "video30SecWatchedActions",   label: "Video visto 30s",         shortLabel: "30s",        category: "Video", format: formatNumber,  sortable: false, defaultSelected: false },
  { key: "videoThruplayWatchedActions",label: "ThruPlay",                shortLabel: "ThruPlay",   category: "Video", format: formatNumber,  sortable: false, defaultSelected: false },
  { key: "videoAvgTimeWatchedActions", label: "Tiempo prom. de video",   shortLabel: "T. prom.",   category: "Video", format: formatSeconds, sortable: false, defaultSelected: false },
  { key: "videoP25WatchedActions",     label: "Video al 25%",            shortLabel: "V.25%",      category: "Video", format: formatNumber,  sortable: false, defaultSelected: false },
  { key: "videoP50WatchedActions",     label: "Video al 50%",            shortLabel: "V.50%",      category: "Video", format: formatNumber,  sortable: false, defaultSelected: false },
  { key: "videoP75WatchedActions",     label: "Video al 75%",            shortLabel: "V.75%",      category: "Video", format: formatNumber,  sortable: false, defaultSelected: false },
  { key: "videoP100WatchedActions",    label: "Video al 100%",           shortLabel: "V.100%",     category: "Video", format: formatNumber,  sortable: false, defaultSelected: false },
];

const DEFAULT_SELECTED = new Set<AnyMetricKey>(
  ALL_METRIC_DEFS.filter((d) => d.defaultSelected).map((d) => d.key)
);

const LS_KEY = "otc_ads_columns_v2";

function loadSavedColumns(): Set<AnyMetricKey> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed: string[] = JSON.parse(raw);
    return parsed.length > 0 ? new Set(parsed as AnyMetricKey[]) : null;
  } catch {
    return null;
  }
}

function buildActionDef(actionKey: string): MetricDef {
  const label = formatActionKey(actionKey);
  return {
    key: `action:${actionKey}` as DynamicMetricKey,
    label,
    shortLabel: label.length > 12 ? label.slice(0, 10) + "…" : label,
    category: "Eventos",
    format: formatNumber,
    sortable: true,
    defaultSelected: false,
    isDynamic: true,
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useMetricColumns(availableActions: string[] = []) {
  const [selected, setSelected] = useState<Set<AnyMetricKey>>(DEFAULT_SELECTED);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadSavedColumns();
    if (saved) setSelected(saved);
    setHydrated(true);
  }, []);

  const dynamicDefs = useMemo(
    () => availableActions.map(buildActionDef),
    [availableActions]
  );

  const allDefs = useMemo(
    () => [...ALL_METRIC_DEFS, ...dynamicDefs],
    [dynamicDefs]
  );

  const toggle = (key: AnyMetricKey) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size <= 1) return prev;
        next.delete(key);
      } else {
        next.add(key);
      }
      try { localStorage.setItem(LS_KEY, JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  };

  const reset = () => {
    setSelected(DEFAULT_SELECTED);
    try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
  };

  // Preserve definition order: static first, then dynamic
  const activeDefs = allDefs.filter((d) => selected.has(d.key));

  return { selected, toggle, reset, activeDefs, dynamicDefs, hydrated };
}

// ─── MetricColumnSelector component ─────────────────────────────────────────

export function MetricColumnSelector({
  selected,
  onToggle,
  onReset,
  dynamicDefs = [],
}: {
  selected: Set<AnyMetricKey>;
  onToggle: (key: AnyMetricKey) => void;
  onReset: () => void;
  dynamicDefs?: MetricDef[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const isDefault =
    selected.size === DEFAULT_SELECTED.size &&
    [...selected].every((k) => DEFAULT_SELECTED.has(k));

  const staticCategories = ["Performance", "Conversiones", "Video"] as const;
  const hasEvents = dynamicDefs.length > 0;

  function MetricItem({ def }: { def: MetricDef }) {
    const isSelected = selected.has(def.key);
    return (
      <button
        key={def.key}
        type="button"
        onClick={() => onToggle(def.key)}
        className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted"
      >
        <span
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
            isSelected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background"
          )}
        >
          {isSelected && <Check className="h-3 w-3" aria-hidden />}
        </span>
        <span className={cn("text-left", !isSelected && "text-muted-foreground")}>
          {def.label}
        </span>
      </button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
          open
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-border bg-background text-foreground hover:bg-muted"
        )}
      >
        <Columns3 className="h-4 w-4" aria-hidden />
        Columnas
        <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
          {selected.size}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-border bg-background shadow-float">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <p className="text-sm font-semibold">Columnas visibles</p>
            <div className="flex items-center gap-2">
              {!isDefault && (
                <button
                  type="button"
                  onClick={onReset}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Restablecer
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                aria-label="Cerrar"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          </div>

          {/* Metric list */}
          <div className="max-h-[480px] overflow-y-auto p-2">
            {staticCategories.map((cat) => {
              const defs = ALL_METRIC_DEFS.filter((d) => d.category === cat);
              return (
                <div key={cat} className="mb-1">
                  <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {cat}
                  </p>
                  {defs.map((def) => <MetricItem key={def.key} def={def} />)}
                </div>
              );
            })}

            {hasEvents && (
              <div className="mb-1 border-t pt-1 mt-1">
                <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Eventos de Meta
                </p>
                <p className="px-2 pb-1.5 text-[10px] text-muted-foreground/70">
                  Acciones reales de tu píxel de Meta
                </p>
                {dynamicDefs.map((def) => <MetricItem key={def.key} def={def} />)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
