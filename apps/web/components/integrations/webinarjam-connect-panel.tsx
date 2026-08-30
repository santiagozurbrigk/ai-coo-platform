"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Info, RefreshCw, Video } from "lucide-react";
import { Button, Input, Label, cn } from "@ai-coo/ui";
import {
  connectWebinarJamAction,
  disconnectWebinarJamAction,
  setWebinarJamPitchSecondAction,
  syncWebinarJamRegistrantsAction,
  syncWebinarJamWebinarsAction,
  type WebinarJamStatus,
  type WebinarJamWebinarOption,
} from "@/app/webinarjam/actions";
import { useToast } from "@/providers/toast-provider";

/**
 * Conexión de WebinarJam / EverWebinar — unidad I-5.
 *
 * Dos cosas que el panel tiene que decir en voz alta, porque no son obvias y
 * cambian lo que el embudo puede medir:
 *
 * 1. **El segundo de la oferta se configura acá.** La API de WebinarJam no lo
 *    expone (a diferencia de VTurb). Sin ese número no se puede saber quién se
 *    quedó hasta la oferta.
 * 2. **Los clicks al CTA no se pueden medir.** La API no los expone. Lo más
 *    cercano que hay es "compró en la sala", que es conversión y no intención.
 */
export function WebinarJamConnectPanel({
  status,
  webinars,
}: {
  status: WebinarJamStatus;
  webinars: WebinarJamWebinarOption[];
}) {
  const router = useRouter();
  const { push } = useToast();
  const [isPending, startTransition] = useTransition();
  const [apiKey, setApiKey] = useState("");

  function handleConnect() {
    startTransition(async () => {
      const result = await connectWebinarJamAction(apiKey);
      if (!result.success) {
        push({ title: "No se pudo conectar WebinarJam", description: result.error });
        return;
      }
      setApiKey("");
      push({
        title: "WebinarJam conectado",
        description: `${result.data.webinars} webinars sincronizados`,
        variant: "success",
      });
      router.refresh();
    });
  }

  function handleSyncWebinars() {
    startTransition(async () => {
      const result = await syncWebinarJamWebinarsAction();
      if (!result.success) {
        push({ title: "No se pudieron sincronizar los webinars", description: result.error });
        return;
      }
      push({
        title: "Webinars sincronizados",
        description: `${result.data.webinars} webinars`,
        variant: "success",
      });
      router.refresh();
    });
  }

  function handleSyncRegistrants() {
    startTransition(async () => {
      const result = await syncWebinarJamRegistrantsAction();
      if (!result.success) {
        push({ title: "No se pudieron traer los registrantes", description: result.error });
        return;
      }
      push({
        title: "Registrantes actualizados",
        description: `${result.data.registrants} personas${
          result.data.webinarsWithoutPitch > 0
            ? ` · ${result.data.webinarsWithoutPitch} webinars sin segundo de oferta`
            : ""
        }`,
        variant: "success",
      });
      router.refresh();
    });
  }

  function handleDisconnect() {
    startTransition(async () => {
      const result = await disconnectWebinarJamAction();
      if (!result.success) {
        push({ title: "No se pudo desconectar", description: result.error });
        return;
      }
      push({ title: "WebinarJam desconectado", variant: "success" });
      router.refresh();
    });
  }

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-medium">WebinarJam / EverWebinar</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Registrados, asistentes y cuántos se quedan hasta la oferta del embudo Webinar.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 dark:border-glass dark:bg-glass">
        {!status.connected ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="webinarjam-api-key" className="text-xs">
                API key
              </Label>
              <Input
                id="webinarjam-api-key"
                type="password"
                autoComplete="off"
                value={apiKey}
                placeholder="En el panel: Advanced → API custom integration"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)}
              />
              <p className="inline-flex items-start gap-1.5 text-xs text-muted-foreground">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                La API de WebinarJam requiere aprobación previa de su equipo — no alcanza
                con tener cuenta. Sirve la misma key para WebinarJam y EverWebinar.
              </p>
            </div>
            <Button size="sm" disabled={isPending || !apiKey.trim()} onClick={handleConnect}>
              Conectar WebinarJam
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1 text-xs">
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  <Video className="h-4 w-4 text-primary" />
                  {status.webinarCount} webinars · {status.registrantCount} registrantes
                </p>
                <p className="text-muted-foreground">
                  {status.registrantsSyncedAt
                    ? `Registrantes actualizados el ${new Date(status.registrantsSyncedAt).toLocaleString("es-AR")}`
                    : "Todavía no se trajeron los registrantes."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" disabled={isPending} onClick={handleSyncWebinars}>
                  <RefreshCw className={cn("mr-2 h-4 w-4", isPending && "animate-spin")} />
                  Webinars
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={handleSyncRegistrants}
                >
                  Traer registrantes
                </Button>
                <Button variant="outline" size="sm" disabled={isPending} onClick={handleDisconnect}>
                  Desconectar
                </Button>
              </div>
            </div>

            {webinars.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-medium">Segundo en el que aparece la oferta</p>
                <p className="text-xs text-muted-foreground">
                  WebinarJam no publica este dato, así que hay que cargarlo. Sin él, la
                  medida &ldquo;se quedaron hasta la oferta&rdquo; va a decir &ldquo;sin
                  datos&rdquo;.
                </p>
                <div className="space-y-2">
                  {webinars.map((webinar) => (
                    <PitchSecondRow key={`${webinar.product}:${webinar.webinarId}`} webinar={webinar} />
                  ))}
                </div>
              </div>
            ) : null}

            <p className="inline-flex items-start gap-1.5 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              El paso &ldquo;Clicked CTA&rdquo; del embudo Webinar queda sin fuente: la API
              de WebinarJam no expone los clicks al CTA. Lo único parecido que da es
              &ldquo;compró en la sala&rdquo;, que mide otra cosa.
            </p>

            {status.lastError ? (
              <p className="inline-flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Último error: {status.lastError}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}

function PitchSecondRow({ webinar }: { webinar: WebinarJamWebinarOption }) {
  const router = useRouter();
  const { push } = useToast();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(webinar.pitchSecond ? String(webinar.pitchSecond) : "");

  function handleSave() {
    startTransition(async () => {
      const parsed = value.trim() ? Number(value) : null;
      const result = await setWebinarJamPitchSecondAction(
        webinar.product,
        webinar.webinarId,
        parsed
      );
      if (!result.success) {
        push({ title: "No se pudo guardar", description: result.error });
        return;
      }
      push({ title: "Segundo de la oferta guardado", variant: "success" });
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 px-3 py-2">
      <span className="min-w-0 flex-1 truncate text-xs">
        {webinar.name ?? webinar.webinarId}
        <span className="ml-1.5 text-muted-foreground">({webinar.product})</span>
      </span>
      <Input
        type="number"
        min={1}
        value={value}
        placeholder="segundos"
        disabled={isPending}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
        className="w-28"
      />
      <Button variant="outline" size="sm" disabled={isPending} onClick={handleSave}>
        Guardar
      </Button>
      {!webinar.pitchSecond ? (
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
      ) : null}
    </div>
  );
}
