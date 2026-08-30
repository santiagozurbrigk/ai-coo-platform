"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Copy, GitBranch, RefreshCw } from "lucide-react";
import { Button, cn } from "@ai-coo/ui";
import {
  regenerateGHLWebhookSecretAction,
  syncGHLPipelinesAction,
  type GHLOpportunitiesStatus,
} from "@/app/ghl/opportunity-actions";
import { useToast } from "@/providers/toast-provider";

/**
 * Configuración de las oportunidades de GHL — unidad I-4.
 *
 * Tiene dos pasos porque el módulo necesita dos cosas distintas:
 *
 * 1. **Sincronizar pipelines**, que es sólo un catálogo: sirve para que el
 *    usuario elija qué etapa alimenta cada paso del embudo.
 * 2. **Recibir webhooks**, que es de dónde salen los números. GHL no expone
 *    historial de cambios de etapa, así que sin esto no hay conteos por período.
 *
 * El panel muestra desde cuándo hay historial porque **antes de esa fecha los
 * conteos no existen**, y es más honesto decirlo acá que dejar al usuario
 * descubrirlo mirando un embudo vacío.
 */
export function GHLOpportunitiesPanel({ status }: { status: GHLOpportunitiesStatus }) {
  const router = useRouter();
  const { push } = useToast();
  const [isPending, startTransition] = useTransition();
  const [secretUrl, setSecretUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!status.connected) return null;

  function handleSync() {
    startTransition(async () => {
      const result = await syncGHLPipelinesAction();
      if (!result.success) {
        push({ title: "No se pudieron sincronizar los pipelines", description: result.error });
        return;
      }
      push({
        title: "Pipelines sincronizados",
        description: `${result.data.pipelines} pipelines · ${result.data.stages} etapas${
          result.data.skipped > 0 ? ` · ${result.data.skipped} sin id reconocible` : ""
        }`,
        variant: "success",
      });
      router.refresh();
    });
  }

  function handleRegenerate() {
    startTransition(async () => {
      const result = await regenerateGHLWebhookSecretAction();
      if (!result.success) {
        push({ title: "No se pudo generar el secreto", description: result.error });
        return;
      }
      setSecretUrl(result.data.url);
      push({
        title: "Secreto generado",
        description: "Copiá la URL ahora: no se puede volver a ver.",
        variant: "success",
      });
      router.refresh();
    });
  }

  async function handleCopy() {
    if (!secretUrl) return;
    await navigator.clipboard.writeText(secretUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-medium">Oportunidades de GoHighLevel</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Alimentan las etapas del embudo DM. GoHighLevel no guarda el historial de
          cambios de etapa, así que OTC lo construye con los eventos que recibe.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 dark:border-glass dark:bg-glass">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1 text-xs">
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <GitBranch className="h-4 w-4 text-primary" />
              {status.pipelineCount} pipelines · {status.stageCount} etapas
            </p>
            <p className="text-muted-foreground">
              {status.pipelinesSyncedAt
                ? `Catálogo actualizado el ${new Date(status.pipelinesSyncedAt).toLocaleString("es-AR")}`
                : "El catálogo todavía no se sincronizó."}
            </p>
          </div>
          <Button variant="outline" size="sm" disabled={isPending} onClick={handleSync}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isPending && "animate-spin")} />
            Sincronizar pipelines
          </Button>
        </div>

        <hr className="my-4 border-border/60" />

        <div className="space-y-3">
          <div className="text-xs">
            {status.stageHistorySince ? (
              <p className="text-muted-foreground">
                Historial de etapas desde el{" "}
                <span className="font-medium text-foreground">
                  {new Date(status.stageHistorySince).toLocaleString("es-AR")}
                </span>
                . {status.transitionCount} transiciones registradas. Los períodos anteriores
                a esa fecha aparecen como &ldquo;sin datos&rdquo;, no como cero.
              </p>
            ) : (
              <p className="inline-flex items-start gap-1.5 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Todavía no llegó ningún evento. Hasta que llegue el primero, los pasos del
                embudo que dependan de GoHighLevel van a decir &ldquo;sin datos&rdquo;.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" disabled={isPending} onClick={handleRegenerate}>
              {status.hasWebhookSecret ? "Regenerar secreto" : "Generar secreto del webhook"}
            </Button>
            {status.hasWebhookSecret && !secretUrl ? (
              <span className="text-xs text-muted-foreground">
                Ya hay uno configurado. Regenerarlo invalida el anterior.
              </span>
            ) : null}
          </div>

          {secretUrl ? (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
              <p className="text-xs font-medium">
                Pegá esta URL en la acción &ldquo;Webhook&rdquo; de un Workflow de GoHighLevel
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Usá el trigger &ldquo;Opportunity Stage Changed&rdquo;. Esta URL contiene el
                secreto y no se puede volver a ver.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded bg-background px-2 py-1.5 text-[11px]">
                  {secretUrl}
                </code>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
