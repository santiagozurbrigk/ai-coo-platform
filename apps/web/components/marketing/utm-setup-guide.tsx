"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { UTM_SETUP_SOP } from "@/lib/sops/utm-setup-sop";
import { cn } from "@ai-coo/ui";

const STORAGE_KEY = "utm-setup-guide-dismissed";

export function UTMSetupGuide({ className }: { className?: string }) {
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(STORAGE_KEY) !== "1";
  });
  const [expanded, setExpanded] = useState(true);

  if (!open) return null;

  return (
    <div
      className={cn(
        "rounded-xl border border-violet-500/20 bg-violet-900/10 p-4 backdrop-blur-md dark:border-violet-500/20",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">
            {UTM_SETUP_SOP.title}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {UTM_SETUP_SOP.department} · Guía de configuración
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={expanded ? "Colapsar guía" : "Expandir guía"}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              localStorage.setItem(STORAGE_KEY, "1");
              setOpen(false);
            }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Ocultar
          </button>
        </div>
      </div>

      {expanded ? (
        <ol className="mt-4 space-y-3">
          {UTM_SETUP_SOP.steps.map((item) => (
            <li key={item.step} className="flex gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-xs font-medium text-violet-700 dark:text-violet-400">
                {item.step}
              </span>
              <div>
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="mt-0.5 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      ) : null}

      <div className="mt-4 flex gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-200/90">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <p>{UTM_SETUP_SOP.warning}</p>
      </div>
    </div>
  );
}
