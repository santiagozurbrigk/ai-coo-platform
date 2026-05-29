"use client";

import { useEffect, useState } from "react";
import { Badge, GlassPanel } from "@ai-coo/ui";
import { loadClientTimelineAction } from "@/app/fathom/actions";

type TimelineEntry = Awaited<
  ReturnType<typeof loadClientTimelineAction>
>[number];

const PROGRESS_LABEL: Record<string, string> = {
  improving: "↑ Mejorando",
  stable: "→ Estable",
  declining: "↓ En declive",
  unknown: "—",
};

export function ClientTimeline({ clientId }: { clientId: string }) {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    loadClientTimelineAction(clientId).then(setEntries).catch(() => setEntries([]));
  }, [clientId]);

  if (entries.length === 0) {
    return (
      <GlassPanel className="p-5 text-sm text-muted-foreground">
        Sin entradas en el timeline todavía.
      </GlassPanel>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => {
        const expanded = openId === entry.id;
        const fathomUrl =
          entry.fathom_calls &&
          typeof entry.fathom_calls === "object" &&
          "fathom_url" in entry.fathom_calls
            ? (entry.fathom_calls as { fathom_url: string | null }).fathom_url
            : null;

        return (
          <GlassPanel key={entry.id} className="p-5">
            <button
              type="button"
              className="w-full text-left"
              onClick={() => setOpenId(expanded ? null : entry.id)}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">
                  {new Date(entry.created_at).toLocaleDateString("es", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  — {entry.title}
                </p>
                {entry.progress_indicator && (
                  <Badge variant="secondary">
                    {PROGRESS_LABEL[entry.progress_indicator] ??
                      entry.progress_indicator}
                  </Badge>
                )}
              </div>
            </button>

            {expanded && (
              <div className="mt-4 space-y-3 text-sm">
                {entry.situation_summary && (
                  <p>
                    <span className="text-muted-foreground">Situación: </span>
                    {entry.situation_summary}
                  </p>
                )}
                {(entry.next_steps ?? []).length > 0 && (
                  <div>
                    <p className="text-muted-foreground mb-1">Próximos pasos:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {(entry.next_steps ?? []).map((step: string) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {(entry.problems_detected ?? []).length > 0 && (
                  <div>
                    <p className="text-muted-foreground mb-1">
                      Problemas detectados:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      {(entry.problems_detected ?? []).map((p: string) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {fathomUrl && (
                  <a
                    href={fathomUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary text-xs inline-block"
                  >
                    Ver llamada en Fathom ↗
                  </a>
                )}
              </div>
            )}
          </GlassPanel>
        );
      })}
    </div>
  );
}
