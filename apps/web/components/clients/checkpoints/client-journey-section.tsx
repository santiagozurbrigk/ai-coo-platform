"use client";

/**
 * C2 · La sección "Recorrido" en la ficha del cliente.
 *
 * Dibuja los checkpoints del recorrido en orden, cada uno alcanzado (con fecha y
 * métricas) o pendiente (con botón "Registrar"). Un hueco —un pendiente entre
 * dos alcanzados— se muestra tal cual: la realidad es desprolija.
 */

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Badge, Button, GlassPanel, cn } from "@ai-coo/ui";
import { CheckCircle2, Circle, Clock, RotateCcw } from "lucide-react";
import { useToast } from "@/providers/toast-provider";
import type {
  Checkpoint,
  CheckpointEvent,
  CheckpointWithEvent,
} from "@/types/checkpoints";
import type { FieldDefinition } from "@/types/custom-fields";
import { fieldOptionColorVar, formatFieldValue } from "@/lib/custom-fields";
import { resolveMetricSchema, summarizeJourneyPosition } from "@/lib/checkpoints";
import {
  getClientJourneyAction,
  recordCheckpointAction,
  undoCheckpointAction,
} from "@/app/clients/checkpoint-event-actions";
import { paths } from "@/routes";
import { RecordCheckpointDialog } from "@/components/clients/checkpoints/record-checkpoint-dialog";

type JourneyData = Awaited<ReturnType<typeof getClientJourneyAction>>;

const EMPTY: JourneyData = {
  progress: [],
  checkpointFields: [],
  journeyConfigured: false,
};

export function ClientJourneySection({ clientId }: { clientId: string }) {
  const { push } = useToast();
  const [data, setData] = useState<JourneyData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let alive = true;
    getClientJourneyAction(clientId)
      .then((next) => {
        if (alive) setData(next);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [clientId]);
  const [dialog, setDialog] = useState<{
    open: boolean;
    checkpoint: Checkpoint | null;
    event: CheckpointEvent | null;
  }>({ open: false, checkpoint: null, event: null });
  const [dialogError, setDialogError] = useState<string | null>(null);

  const { progress, checkpointFields, journeyConfigured } = data;
  const summary = summarizeJourneyPosition(progress);

  // Mientras carga no se muestra nada. Si el recorrido no está configurado,
  // tampoco: mandar a configurarlo desde la ficha de un cliente sería ruido.
  // El lugar para configurarlo es su propia pantalla.
  if (loading || !journeyConfigured) return null;
  const currentStageName =
    progress.find((entry) => entry.stage.id === summary.currentStageId)?.stage.name ?? null;

  async function refresh() {
    setData(await getClientJourneyAction(clientId));
  }

  function submit(input: {
    reachedAt: string;
    metrics: Record<string, unknown>;
    note: string | null;
  }) {
    if (!dialog.checkpoint) return;
    setDialogError(null);
    startTransition(async () => {
      const result = await recordCheckpointAction({
        clientId,
        checkpointId: dialog.checkpoint!.id,
        ...input,
      });
      if (!result.success) {
        setDialogError(result.error);
        return;
      }
      setDialog({ open: false, checkpoint: null, event: null });
      await refresh();
      push({ title: "Checkpoint registrado", variant: "success" });
    });
  }

  function undo(entry: CheckpointWithEvent) {
    if (!entry.event) return;
    const warnsStatus = entry.checkpoint.setsClientStatus !== null;
    const message = warnsStatus
      ? `¿Deshacer "${entry.checkpoint.name}"? El estado del cliente no vuelve solo: si lo había cambiado, ajustalo a mano.`
      : `¿Deshacer "${entry.checkpoint.name}"?`;
    if (!window.confirm(message)) return;

    startTransition(async () => {
      const result = await undoCheckpointAction(entry.event!.id, clientId);
      if (!result.success) {
        push({ title: "No se pudo deshacer", description: result.error });
        return;
      }
      await refresh();
    });
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium">Recorrido</h2>
        {journeyConfigured && summary.total > 0 ? (
          <span className="text-xs text-muted-foreground">
            {summary.reached} de {summary.total}
            {currentStageName ? ` · ${currentStageName}` : ""}
          </span>
        ) : null}
      </div>

      {summary.total === 0 ? (
        <GlassPanel className="p-4 text-sm text-muted-foreground">
          El recorrido tiene fases pero todavía ningún checkpoint.{" "}
          <Link
            href={paths.platform.clients.checkpoints}
            className="text-primary underline-offset-4 hover:underline"
          >
            Agregá el primero
          </Link>
          .
        </GlassPanel>
      ) : (
        <GlassPanel className="divide-y divide-border/40 p-0">
          {progress.map((entry) => (
            <CheckpointLine
              key={entry.checkpoint.id}
              entry={entry}
              checkpointFields={checkpointFields}
              pending={pending}
              onRecord={() => {
                setDialogError(null);
                setDialog({ open: true, checkpoint: entry.checkpoint, event: entry.event });
              }}
              onUndo={() => undo(entry)}
            />
          ))}
        </GlassPanel>
      )}

      <RecordCheckpointDialog
        open={dialog.open}
        checkpoint={dialog.checkpoint}
        checkpointFields={checkpointFields}
        existingEvent={dialog.event}
        saving={pending}
        error={dialogError}
        onClose={() => setDialog({ open: false, checkpoint: null, event: null })}
        onSubmit={submit}
      />
    </section>
  );
}

function CheckpointLine({
  entry,
  checkpointFields,
  pending,
  onRecord,
  onUndo,
}: {
  entry: CheckpointWithEvent;
  checkpointFields: FieldDefinition[];
  pending: boolean;
  onRecord: () => void;
  onUndo: () => void;
}) {
  const { checkpoint, stage, event } = entry;
  const reached = event !== null;

  return (
    <div className="flex items-start gap-3 p-3">
      <span
        className="mt-0.5 shrink-0"
        style={{ color: reached ? fieldOptionColorVar(stage.color) : undefined }}
      >
        {reached ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Circle className="h-4 w-4 text-muted-foreground/50" />
        )}
      </span>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("text-sm", !reached && "text-muted-foreground")}>
            {checkpoint.name}
          </span>
          <Badge variant="outline" className="text-[10px]">
            {stage.name}
          </Badge>
          {!reached && checkpoint.expectedDays !== null ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {checkpoint.expectedDays} d
            </span>
          ) : null}
        </div>

        {reached ? (
          <p className="text-xs text-muted-foreground">
            {new Date(event.reachedAt).toLocaleDateString("es-AR", {
              day: "numeric",
              month: "short",
              year: "numeric",
              timeZone: "UTC",
            })}
          </p>
        ) : null}

        {reached ? (
          <ReachedMetrics event={event} checkpoint={checkpoint} checkpointFields={checkpointFields} />
        ) : null}

        {reached && event.note ? (
          <p className="text-xs text-muted-foreground">{event.note}</p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {reached ? (
          <>
            <Button variant="ghost" size="sm" disabled={pending} onClick={onRecord}>
              Editar
            </Button>
            <Button variant="ghost" size="icon" title="Deshacer" disabled={pending} onClick={onUndo}>
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" disabled={pending} onClick={onRecord}>
            Registrar
          </Button>
        )}
      </div>
    </div>
  );
}

function ReachedMetrics({
  event,
  checkpoint,
  checkpointFields,
}: {
  event: CheckpointEvent;
  checkpoint: Checkpoint;
  checkpointFields: FieldDefinition[];
}) {
  const resolved = resolveMetricSchema(checkpoint.metricSchema, checkpointFields);
  const shown = resolved
    .filter((entry) => entry.field !== null)
    .map((entry) => {
      const formatted = formatFieldValue(entry.field!, event.metrics[entry.metric.fieldKey]);
      return { label: entry.field!.label, text: formatted.isEmpty ? null : formatted.parts.map((p) => p.text).join(", ") };
    })
    .filter((entry) => entry.text !== null);

  if (shown.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-0.5">
      {shown.map((metric) => (
        <span key={metric.label} className="text-xs">
          <span className="text-muted-foreground">{metric.label}:</span> {metric.text}
        </span>
      ))}
    </div>
  );
}
