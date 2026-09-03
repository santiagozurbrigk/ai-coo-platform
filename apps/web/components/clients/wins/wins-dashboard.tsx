"use client";

/**
 * A · W2 — El dashboard de casos.
 *
 * Responde una pregunta distinta a la del tracker: *"¿qué recorrido hizo este
 * cliente?"* — nicho, punto inicial → final, y en cuánto tiempo.
 *
 * ⭐ Si un cliente no tiene dos puntos numéricos comparables, dice **"sin medir"**
 * y explica por qué. No estima, no interpola, y no muestra una flecha verde sin
 * datos que la sostengan.
 */

import { useState, useTransition } from "react";
import { Badge, Button, GlassPanel, cn } from "@ai-coo/ui";
import { ArrowRight, Minus, Pencil, TrendingDown, TrendingUp } from "lucide-react";
import type { Client } from "@/types/clients";
import type { ClientBaseline, ClientWin } from "@/types/wins";
import { WIN_USAGE_CHANNEL_LABEL } from "@/types/wins";
import {
  UNMEASURED_REASON_LABEL,
  deriveClientCase,
  groupWinsByClient,
} from "@/lib/wins";
import { EmptyState } from "@/components/shared/empty-state";
import { Trophy } from "lucide-react";
import { useToast } from "@/providers/toast-provider";
import { updateClientBaselineAction } from "@/app/clients/win-actions";
import {
  ClientBaselineDialog,
  type BaselineDraft,
} from "@/components/clients/wins/client-baseline-dialog";

export function WinsDashboard({
  wins,
  clients,
  baselines,
  niches,
  onChanged,
}: {
  wins: ClientWin[];
  clients: Client[];
  baselines: Record<string, ClientBaseline>;
  niches: Record<string, string>;
  onChanged: () => Promise<void>;
}) {
  const { push } = useToast();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<Client | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);

  const byClient = groupWinsByClient(wins);
  const clientsWithWins = clients.filter((client) => byClient.has(client.id));

  if (clientsWithWins.length === 0) {
    return (
      <EmptyState
        icon={<Trophy className="h-6 w-6" />}
        title="Todavía no hay wins cargados"
        description="Cargá el primero en el tracker. Cuando un cliente tenga dos números comparables, acá vas a ver su recorrido."
      />
    );
  }

  function submitBaseline(draft: BaselineDraft) {
    if (!editing) return;
    setDialogError(null);

    // Igual que la medida de un win: o están la clave y el número, o no hay
    // punto de partida. Guardar medio baseline sería guardar algo que no se
    // puede usar.
    const key = draft.metricKey.trim();
    const rawValue = draft.metricValue.trim();
    if ((key === "") !== (rawValue === "")) {
      setDialogError("El punto de partida necesita la clave y el número, o ninguno.");
      return;
    }
    const value = rawValue === "" ? null : Number(rawValue.replace(",", "."));
    if (value !== null && !Number.isFinite(value)) {
      setDialogError("El número del punto de partida no se entiende.");
      return;
    }

    startTransition(async () => {
      const result = await updateClientBaselineAction(editing.id, {
        niche: draft.niche.trim() || null,
        baselineMetricKey: key || null,
        baselineMetricValue: value,
        baselineMetricUnit: draft.metricUnit.trim() || null,
        baselineCapturedAt: draft.capturedAt || null,
      });
      if (!result.success) {
        setDialogError(result.error);
        return;
      }
      setEditing(null);
      await onChanged();
      push({ title: "Guardado", variant: "success" });
    });
  }

  return (
    <div className="space-y-3">
      {clientsWithWins.map((client) => (
        <ClientCaseCard
          key={client.id}
          client={client}
          wins={byClient.get(client.id) ?? []}
          baseline={baselines[client.id] ?? null}
          niche={niches[client.id] ?? null}
          pending={pending}
          onEdit={() => {
            setDialogError(null);
            setEditing(client);
          }}
        />
      ))}

      <ClientBaselineDialog
        open={editing !== null}
        clientName={editing?.name ?? ""}
        niche={editing ? (niches[editing.id] ?? null) : null}
        baseline={editing ? (baselines[editing.id] ?? null) : null}
        saving={pending}
        error={dialogError}
        onClose={() => setEditing(null)}
        onSubmit={submitBaseline}
      />
    </div>
  );
}

function ClientCaseCard({
  client,
  wins,
  baseline,
  niche,
  pending,
  onEdit,
}: {
  client: Client;
  wins: ClientWin[];
  baseline: ClientBaseline | null;
  niche: string | null;
  pending: boolean;
  onEdit: () => void;
}) {
  const result = deriveClientCase(wins, baseline);
  const usages = wins.flatMap((win) => win.usages);

  return (
    <GlassPanel className="space-y-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{client.name}</span>
          {niche ? <Badge variant="outline">{niche}</Badge> : null}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {wins.length} win{wins.length > 1 ? "s" : ""}
          </span>
          <Button
            variant="ghost"
            size="icon"
            title="Nicho y punto de partida"
            disabled={pending}
            onClick={onEdit}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {result.measured ? (
        <div className="flex flex-wrap items-center gap-3">
          <Point label="Punto inicial" value={result.start.value} unit={result.unit} />
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Point label="Punto final" value={result.end.value} unit={result.unit} />

          <div className="flex items-center gap-1.5">
            <Trend delta={result.delta} />
            <span
              className={cn(
                "text-sm tabular-nums",
                result.delta > 0 && "text-emerald-500",
                result.delta < 0 && "text-destructive"
              )}
            >
              {result.delta > 0 ? "+" : ""}
              {formatNumber(result.delta)}
              {result.deltaPercent !== null
                ? ` (${result.deltaPercent > 0 ? "+" : ""}${Math.round(result.deltaPercent)}%)`
                : ""}
            </span>
          </div>

          <span className="text-sm text-muted-foreground">
            en {result.days} día{result.days > 1 ? "s" : ""}
          </span>

          <Badge variant="secondary" className="ml-auto">
            {result.metricKey}
          </Badge>
        </div>
      ) : (
        // ⭐ "Sin medir" con el motivo: decirlo a secas no ayuda a arreglarlo.
        <div className="space-y-0.5">
          <p className="text-sm text-muted-foreground">Sin medir</p>
          <p className="text-xs text-muted-foreground">
            {UNMEASURED_REASON_LABEL[result.reason]}
          </p>
        </div>
      )}

      {usages.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border/40 pt-2">
          <span className="text-xs text-muted-foreground">Usado en:</span>
          {usages.map((usage) => (
            <span
              key={usage.id}
              className="rounded-full border border-border/60 px-2 py-0.5 text-[11px]"
            >
              {WIN_USAGE_CHANNEL_LABEL[usage.channel]}
              {usage.locationLabel ? ` · ${usage.locationLabel}` : ""}
            </span>
          ))}
        </div>
      ) : null}
    </GlassPanel>
  );
}

function Point({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string | null;
}) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm tabular-nums">
        {formatNumber(value)}
        {unit ? <span className="ml-1 text-xs text-muted-foreground">{unit}</span> : null}
      </p>
    </div>
  );
}

function Trend({ delta }: { delta: number }) {
  if (delta > 0) return <TrendingUp className="h-4 w-4 text-emerald-500" />;
  if (delta < 0) return <TrendingDown className="h-4 w-4 text-destructive" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(value);
}
