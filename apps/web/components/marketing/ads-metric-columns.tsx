"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Columns3, X } from "lucide-react";
import {
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

export type MetricDef = {
  key: MetricKey;
  label: string;
  shortLabel: string;
  category: "Performance" | "Conversiones" | "Video";
  format: (v: number) => string;
  sortable: boolean;
  colorFn?: (v: number) => string;
  defaultSelected: boolean;
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

const DEFAULT_SELECTED = new Set<MetricKey>(
  ALL_METRIC_DEFS.filter((d) => d.defaultSelected).map((d) => d.key)
);

const LS_KEY = "otc_ads_columns_v1";

function loadSavedColumns(): Set<MetricKey> {
  if (typeof window === "undefined") return DEFAULT_SELECTED;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_SELECTED;
    const parsed: string[] = JSON.parse(raw);
    const valid = parsed.filter((k) => ALL_METRIC_DEFS.some((d) => d.key === k));
    return valid.length > 0 ? new Set(valid as MetricKey[]) : DEFAULT_SELECTED;
  } catch {
    return DEFAULT_SELECTED;
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useMetricColumns() {
  const [selected, setSelected] = useState<Set<MetricKey>>(DEFAULT_SELECTED);

  useEffect(() => {
    setSelected(loadSavedColumns());
  }, []);

  const toggle = (key: MetricKey) => {
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

  // Preserve definition order
  const activeDefs = ALL_METRIC_DEFS.filter((d) => selected.has(d.key));

  return { selected, toggle, reset, activeDefs };
}

// ─── MetricColumnSelector component ─────────────────────────────────────────

export function MetricColumnSelector({
  selected,
  onToggle,
  onReset,
}: {
  selected: Set<MetricKey>;
  onToggle: (key: MetricKey) => void;
  onReset: () => void;
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

  const categories = ["Performance", "Conversiones", "Video"] as const;

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
        <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-white">
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
          <div className="max-h-[420px] overflow-y-auto p-2">
            {categories.map((cat) => {
              const defs = ALL_METRIC_DEFS.filter((d) => d.category === cat);
              return (
                <div key={cat} className="mb-1">
                  <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {cat}
                  </p>
                  {defs.map((def) => {
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
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
