"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, PlayCircle, RefreshCw } from "lucide-react";
import { Button, Input, Label, cn } from "@ai-coo/ui";
import {
  connectVTurbAction,
  disconnectVTurbAction,
  syncVTurbPlayersAction,
  type VTurbStatus,
} from "@/app/vturb/actions";
import { useToast } from "@/providers/toast-provider";

/**
 * Conexión de VTurb — unidad I-6.
 *
 * VTurb hostea los VSL. De acá salen los visitantes de la página, las
 * reproducciones, el porcentaje promedio visto y cuántos llegaron al CTA.
 *
 * El panel avisa cuando hay players **sin pitch time configurado**, porque en
 * esos videos la medida "llegaron al CTA" no se puede calcular: VTurb devuelve
 * `pitch_time = 0` y su `total_over_pitch` pasa a contar a casi todo el mundo.
 * Es un problema que se arregla en VTurb, no en OTC, y por eso conviene decirlo
 * acá.
 */
export function VTurbConnectPanel({ status }: { status: VTurbStatus }) {
  const router = useRouter();
  const { push } = useToast();
  const [isPending, startTransition] = useTransition();
  const [apiKey, setApiKey] = useState("");

  function handleConnect() {
    startTransition(async () => {
      const result = await connectVTurbAction(apiKey);
      if (!result.success) {
        push({ title: "No se pudo conectar VTurb", description: result.error });
        return;
      }
      setApiKey("");
      push({
        title: "VTurb conectado",
        description: `${result.data.players} videos sincronizados`,
        variant: "success",
      });
      router.refresh();
    });
  }

  function handleSync() {
    startTransition(async () => {
      const result = await syncVTurbPlayersAction();
      if (!result.success) {
        push({ title: "No se pudieron sincronizar los videos", description: result.error });
        return;
      }
      push({
        title: "Videos sincronizados",
        description: `${result.data.players} videos${
          result.data.withoutPitchTime > 0
            ? ` · ${result.data.withoutPitchTime} sin pitch time`
            : ""
        }`,
        variant: "success",
      });
      router.refresh();
    });
  }

  function handleDisconnect() {
    startTransition(async () => {
      const result = await disconnectVTurbAction();
      if (!result.success) {
        push({ title: "No se pudo desconectar", description: result.error });
        return;
      }
      push({ title: "VTurb desconectado", variant: "success" });
      router.refresh();
    });
  }

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-medium">VTurb</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Hosting de los VSL. Alimenta las reproducciones, la retención y cuántos llegan
          al CTA del embudo VSL.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 dark:border-glass dark:bg-glass">
        {!status.connected ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="vturb-api-key" className="text-xs">
                API key de Analytics
              </Label>
              <Input
                id="vturb-api-key"
                type="password"
                autoComplete="off"
                value={apiKey}
                placeholder="Se genera en app.vturb.com → Settings → Analytics API"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Es la key de la cuenta: ve todos los videos de la empresa.
              </p>
            </div>
            <Button size="sm" disabled={isPending || !apiKey.trim()} onClick={handleConnect}>
              Conectar VTurb
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1 text-xs">
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  <PlayCircle className="h-4 w-4 text-primary" />
                  {status.playerCount} videos
                </p>
                <p className="text-muted-foreground">
                  {status.playersSyncedAt
                    ? `Actualizado el ${new Date(status.playersSyncedAt).toLocaleString("es-AR")}`
                    : "Todavía no se sincronizó el catálogo."}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={isPending} onClick={handleSync}>
                  <RefreshCw className={cn("mr-2 h-4 w-4", isPending && "animate-spin")} />
                  Sincronizar videos
                </Button>
                <Button variant="outline" size="sm" disabled={isPending} onClick={handleDisconnect}>
                  Desconectar
                </Button>
              </div>
            </div>

            {status.playersWithoutPitchTime > 0 ? (
              <p className="inline-flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {status.playersWithoutPitchTime} de {status.playerCount} videos no tienen
                configurado el <span className="font-medium">pitch time</span> en VTurb. En
                esos, la medida &ldquo;llegaron al CTA&rdquo; va a decir &ldquo;sin
                datos&rdquo;: sin saber en qué segundo está la oferta, el número que
                devuelve VTurb cuenta a casi todos los que abrieron el video.
              </p>
            ) : null}

            {status.lastError ? (
              <p className="inline-flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Último error de VTurb: {status.lastError}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
