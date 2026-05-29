"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Badge, Button, GlassPanel } from "@ai-coo/ui";
import { paths } from "@/routes";
import {
  associateFathomCallAction,
  listPendingFathomCallsAction,
} from "@/app/fathom/actions";

type PendingCall = Awaited<
  ReturnType<typeof listPendingFathomCallsAction>
>[number];

type Candidate = {
  id: string;
  name: string;
  nickname: string | null;
  confidence: number;
};

export function PendingFathomCallsPage({
  initialCalls,
}: {
  initialCalls: PendingCall[];
}) {
  const [calls, setCalls] = useState(initialCalls);
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Record<string, string | null>>({});

  useEffect(() => {
    setCalls(initialCalls);
  }, [initialCalls]);

  function refresh() {
    startTransition(async () => {
      const next = await listPendingFathomCallsAction();
      setCalls(next);
    });
  }

  function confirm(callId: string, clientId: string | null, ignore = false) {
    startTransition(async () => {
      await associateFathomCallAction(callId, clientId, ignore);
      refresh();
    });
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold">Llamadas Fathom sin asociar</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Revisá y confirmá a qué cliente corresponde cada llamada.
        </p>
      </div>

      {calls.length === 0 && (
        <GlassPanel className="p-6 text-sm text-muted-foreground">
          No hay llamadas pendientes.
        </GlassPanel>
      )}

      {calls.map((call) => {
        const candidates = (call.association_candidates ??
          []) as Candidate[];
        const selectedId = selected[call.id] ?? candidates[0]?.id ?? null;

        return (
          <GlassPanel key={call.id} className="p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">{call.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {call.duration_seconds
                    ? `${Math.round(call.duration_seconds / 60)} min`
                    : "—"}{" "}
                  · {new Date(call.created_at).toLocaleString("es")}
                </p>
              </div>
              <Badge variant="secondary">
                {call.status === "pending_review"
                  ? "Revisión"
                  : "Sin coincidencia"}
              </Badge>
            </div>

            {candidates.length > 0 ? (
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  Encontramos {candidates.length} cliente(s) posible(s):
                </p>
                {candidates.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-2 rounded-lg border border-border/50 px-3 py-2"
                  >
                    <input
                      type="radio"
                      name={`call-${call.id}`}
                      checked={selectedId === c.id}
                      onChange={() =>
                        setSelected((s) => ({ ...s, [call.id]: c.id }))
                      }
                    />
                    <span>
                      {c.name}
                      {c.nickname ? ` (${c.nickname})` : ""} —{" "}
                      {Math.round(c.confidence * 100)}%
                    </span>
                  </label>
                ))}
                <label className="flex items-center gap-2 text-muted-foreground">
                  <input
                    type="radio"
                    name={`call-${call.id}`}
                    checked={selectedId === null}
                    onChange={() =>
                      setSelected((s) => ({ ...s, [call.id]: null }))
                    }
                  />
                  No es llamada de ningún cliente
                </label>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Sin coincidencias en clientes.
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {candidates.length > 0 && selectedId && (
                <Button
                  size="sm"
                  disabled={pending}
                  onClick={() => confirm(call.id, selectedId)}
                >
                  Confirmar asociación
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => confirm(call.id, null, true)}
              >
                Ignorar
              </Button>
              {call.fathom_url && (
                <Button asChild size="sm" variant="ghost">
                  <a href={call.fathom_url} target="_blank" rel="noreferrer">
                    Ver en Fathom ↗
                  </a>
                </Button>
              )}
            </div>
          </GlassPanel>
        );
      })}

      <Button asChild variant="outline" size="sm">
        <Link href={paths.platform.clients.root}>← Volver a clientes</Link>
      </Button>
    </div>
  );
}
