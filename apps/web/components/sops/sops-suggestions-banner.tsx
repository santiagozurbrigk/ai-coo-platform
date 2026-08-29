"use client";

import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { Button } from "@ai-coo/ui";
import { paths } from "@/routes";
import type { SOPOpportunity } from "@/lib/sops/suggest-sops";

export function SopsSuggestionsBanner({
  suggestions,
}: {
  suggestions: SOPOpportunity[];
}) {
  if (suggestions.length === 0) return null;

  const root = paths.platform.operations.sops;

  return (
    <div className="rounded-xl border border-brand-500/25 bg-brand-500/5 p-4 dark:border-brand-500/20">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-500/30 bg-brand-500/10">
          <Lightbulb className="h-4 w-4 text-brand-400" />
        </div>
        <div>
          <p className="text-sm font-medium">
            Detectamos {suggestions.length}{" "}
            {suggestions.length === 1 ? "proceso" : "procesos"} que podrían
            documentarse como SOP
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Basado en tareas repetidas del Workboard en los últimos 30 días
          </p>
        </div>
      </div>

      <ul className="space-y-2">
        {suggestions.map((s) => (
          <li
            key={s.suggestedTitle}
            className="flex flex-col gap-2 rounded-lg border border-border/40 bg-background/50 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.06]"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{s.suggestedTitle}</p>
              <p className="text-xs text-muted-foreground">{s.reason}</p>
              <p className="text-[10px] text-muted-foreground/80">
                {s.potentialSaving}
              </p>
            </div>
            <Button asChild size="sm" variant="outline" className="shrink-0">
              <Link
                href={`${root}?goal=${encodeURIComponent(s.goal)}&department=${encodeURIComponent(s.department)}#crear`}
              >
                Crear SOP
              </Link>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
