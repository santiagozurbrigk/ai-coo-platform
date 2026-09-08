"use client";

/**
 * A · W3 — Los wins de un cliente, en su ficha.
 *
 * Se auto-fetchea con sólo `clientId`, igual que las otras secciones de la ficha,
 * y no aparece si el cliente no tiene ningún win: una sección vacía en cada
 * cliente sería ruido permanente.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, GlassPanel } from "@ai-coo/ui";
import { Trophy } from "lucide-react";
import type { ClientWin } from "@/types/wins";
import { WIN_USAGE_CHANNEL_LABEL } from "@/types/wins";
import { listWinsAction } from "@/app/clients/win-actions";
import { paths } from "@/routes";

export function ClientWinsSection({ clientId }: { clientId: string }) {
  const [wins, setWins] = useState<ClientWin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    listWinsAction(clientId)
      .then((next) => {
        if (alive) setWins(next);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [clientId]);

  if (loading || wins.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-medium">
          <Trophy className="h-4 w-4" />
          Wins
        </h2>
        <Button asChild variant="ghost" size="sm">
          <Link href={paths.platform.clients.wins}>Ver el tracker</Link>
        </Button>
      </div>

      <GlassPanel className="divide-y divide-border/40 p-0">
        {wins.map((win) => (
          <div key={win.id} className="flex items-start gap-3 p-3">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm">{win.achievement}</span>
                {win.metric ? (
                  <Badge variant="outline" className="tabular-nums">
                    {new Intl.NumberFormat("es-AR").format(win.metric.value)}
                    {win.metric.unit ? ` ${win.metric.unit}` : ""}
                  </Badge>
                ) : null}
              </div>

              <p className="text-xs text-muted-foreground">
                {new Date(`${win.winDate}T12:00:00Z`).toLocaleDateString("es-AR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </p>

              {win.usages.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {win.usages.map((usage) => (
                    <span
                      key={usage.id}
                      className="rounded-full border border-border/60 px-2 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {WIN_USAGE_CHANNEL_LABEL[usage.channel]}
                      {usage.locationLabel ? ` · ${usage.locationLabel}` : ""}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            {win.attachments[0]?.signedUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={win.attachments[0].signedUrl}
                alt={win.attachments[0].fileName}
                className="h-12 w-12 shrink-0 rounded border border-border object-cover"
              />
            ) : null}
          </div>
        ))}
      </GlassPanel>
    </section>
  );
}
