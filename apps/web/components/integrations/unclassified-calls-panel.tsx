"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, HelpCircle } from "lucide-react";
import { Badge, Button } from "@ai-coo/ui";
import {
  classifyCallManuallyAction,
  type UnclassifiedCall,
} from "@/app/fathom/classification-actions";
import type { CallCounterparty } from "@/lib/fathom/classify";
import type { CallPurpose } from "@/lib/fathom/parse-title";
import { useToast } from "@/providers/toast-provider";

/**
 * Cola de llamadas que no se pudieron clasificar.
 *
 * ⭐ **Es lo que reemplaza al valor inventado.** Antes, cuando la clasificación
 * no resolvía, la llamada se guardaba como `"delivery"` y nadie se enteraba: un
 * hueco de instrumentación presentado como dato. Ahora queda sin propósito, con
 * el motivo, y aparece acá para que alguien lo resuelva.
 *
 * Una cola vacía es el estado bueno, y se muestra como tal.
 */

const REASON_TEXT: Record<string, string> = {
  no_signal:
    "Sin señales: no hay invitados cargados, ni tipo de reunión, ni convención en el título.",
  external_unknown_purpose:
    "Sabemos que fue con alguien de afuera, pero no para qué.",
};

const PURPOSE_OPTIONS: { value: CallPurpose; label: string; counterparty: CallCounterparty }[] = [
  { value: "sales", label: "Venta", counterparty: "lead" },
  { value: "delivery", label: "Entrega", counterparty: "client" },
  { value: "team", label: "Equipo", counterparty: "internal" },
];

function formatDate(iso: string | null): string {
  if (!iso) return "Sin fecha";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return date.toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CallRow({ call }: { call: UnclassifiedCall }) {
  const router = useRouter();
  const { push } = useToast();
  const [isPending, startTransition] = useTransition();
  const [resolved, setResolved] = useState(false);

  function handleResolve(option: (typeof PURPOSE_OPTIONS)[number]) {
    startTransition(async () => {
      const result = await classifyCallManuallyAction({
        callId: call.id,
        purpose: option.value,
        counterparty: option.counterparty,
      });
      if (!result.ok) {
        push({ title: "No se pudo clasificar", description: result.error });
        return;
      }
      setResolved(true);
      router.refresh();
    });
  }

  if (resolved) return null;

  return (
    <div className="flex flex-col gap-2 border-b border-border px-4 py-3 last:border-b-0">
      <div className="flex flex-wrap items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{call.title}</p>
          <p className="text-xs text-muted-foreground">
            {formatDate(call.callDate)}
            {call.declaredName ? ` · declarado: ${call.declaredName}` : ""}
          </p>
        </div>
        {call.fathomUrl && (
          <a
            href={call.fathomUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Ver en Fathom
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {call.reason && (
        <p className="text-xs text-muted-foreground">{REASON_TEXT[call.reason]}</p>
      )}

      {call.externalEmails.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {call.externalEmails.slice(0, 4).map((email) => (
            <Badge key={email} variant="outline" className="text-[10px]">
              {email}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        {PURPOSE_OPTIONS.map((option) => (
          <Button
            key={option.value}
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => handleResolve(option)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function UnclassifiedCallsPanel({ calls }: { calls: UnclassifiedCall[] }) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Llamadas sin clasificar</h3>
        </div>
        {calls.length > 0 && (
          <Badge variant="secondary" className="text-[10px]">
            {calls.length}
          </Badge>
        )}
      </div>

      {calls.length === 0 ? (
        <p className="px-4 py-4 text-sm text-muted-foreground">
          Todas las llamadas procesadas tienen propósito asignado.
        </p>
      ) : (
        <div className="flex flex-col">
          {calls.map((call) => (
            <CallRow key={call.id} call={call} />
          ))}
        </div>
      )}
    </div>
  );
}
