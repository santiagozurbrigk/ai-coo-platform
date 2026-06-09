"use client";

import { useRouter } from "next/navigation";
import { paths } from "@/routes";
import { useEffect, useState } from "react";
import { disconnectGoogleIntegrationAction } from "@/app/integrations/actions";
import {
  getCalendlyIntegrationStatusAction,
  pullCalendlyScheduledEventsAction,
} from "@/app/calendly/actions";
import { syncFathomMeetingsAction } from "@/app/fathom/actions";
import { syncInstagramContentAction } from "@/app/instagram/actions";
import { getManyChatIntegrationStatusAction } from "@/app/manychat/actions";
import {
  GOOGLE_OAUTH_START_URL,
  isGoogleIntegrationProvider,
  type GoogleIntegrationProvider,
} from "@/lib/google/oauth-paths";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ai-coo/ui";
import { es } from "@/lib/locale/es";
import { useToast } from "@/providers/toast-provider";
import { useMarketingData, usePlatformData } from "@/providers";
import type { Integration } from "@/types/integrations";
import { CalendlyManualSyncNotice } from "./calendly-manual-sync-notice";
import { FathomConnectDialog } from "./fathom-connect-dialog";
import { ManyChatConnectDialog } from "./manychat-connect-dialog";
import { ManyChatImportDialog } from "./manychat-import-dialog";
import { IntegrationLogo } from "./integration-logo";
import { ManyChatWebhookNotice } from "./manychat-webhook-notice";

const STATUS_LABEL: Record<string, string> = {
  connected: es.status.integration.connected,
  not_connected: es.status.integration.not_connected,
  syncing: es.status.integration.syncing,
};

const COMING_SOON_LABEL = "Próximamente";

const INSTAGRAM_CONNECT_URL = "/api/integrations/instagram/connect";

export function IntegrationCard({ integration }: { integration: Integration }) {
  const router = useRouter();
  const [status, setStatus] = useState(integration.status);
  const [calendlyWebhookEnabled, setCalendlyWebhookEnabled] = useState(true);
  const [connectOpen, setConnectOpen] = useState(false);
  const [fathomConnectOpen, setFathomConnectOpen] = useState(false);
  const [manychatConnectOpen, setManychatConnectOpen] = useState(false);
  const [manychatImportOpen, setManychatImportOpen] = useState(false);
  const [manychatWebhookUrl, setManychatWebhookUrl] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const { push } = useToast();
  const { setInstagramConnected } = useMarketingData();
  const { refreshClosingCalls } = usePlatformData();

  useEffect(() => {
    setStatus(integration.status);
  }, [integration.status]);

  useEffect(() => {
    if (integration.provider !== "calendly") return;
    getCalendlyIntegrationStatusAction()
      .then((s) => {
        setCalendlyWebhookEnabled(s.webhookEnabled);
      })
      .catch(() => {
        setCalendlyWebhookEnabled(true);
      });
  }, [integration.provider, integration.status]);

  useEffect(() => {
    if (integration.provider !== "manychat" || status !== "connected") {
      setManychatWebhookUrl(null);
      return;
    }
    getManyChatIntegrationStatusAction().then((s) => {
      setManychatWebhookUrl(s.webhookUrl ?? null);
    });
  }, [integration.provider, status]);

  const comingSoon = integration.comingSoon === true;

  const statusVariant = comingSoon
    ? "outline"
    : status === "connected"
      ? "success"
      : status === "syncing"
        ? "warning"
        : "secondary";

  const googleProvider = isGoogleIntegrationProvider(integration.provider)
    ? integration.provider
    : null;

  const startGoogleOAuth = (provider: GoogleIntegrationProvider) => {
    window.location.href = GOOGLE_OAUTH_START_URL[provider];
  };

  const startDiscordOAuth = () => {
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
    if (!clientId) {
      push({
        title: "Discord no configurado",
        description: "Falta NEXT_PUBLIC_DISCORD_CLIENT_ID en el entorno.",
        variant: "default",
      });
      return;
    }
    const params = new URLSearchParams({
      client_id: clientId,
      permissions: "68608",
      scope: "bot",
      redirect_uri: `${window.location.origin}/api/integrations/discord/callback`,
      response_type: "code",
    });
    window.open(
      `https://discord.com/oauth2/authorize?${params.toString()}`,
      "_blank"
    );
  };

  const handleDisconnectGoogle = async (provider: GoogleIntegrationProvider) => {
    setSyncing(true);
    try {
      const res = await disconnectGoogleIntegrationAction(provider);
      if (!res.success) {
        push({ title: res.error, variant: "default" });
        return;
      }
      setStatus("not_connected");
      router.refresh();
      push({
        title: "Integración desconectada",
        description: "Podés volver a conectar cuando quieras.",
        variant: "success",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleConnect = () => {
    if (integration.provider === "instagram") {
      window.location.href = INSTAGRAM_CONNECT_URL;
      return;
    }
    if (integration.provider === "calendly") {
      window.location.href = "/api/integrations/calendly/oauth/start";
      return;
    }
    if (integration.provider === "fathom") {
      setFathomConnectOpen(true);
      return;
    }
    if (googleProvider) {
      startGoogleOAuth(googleProvider);
      return;
    }
    if (integration.provider === "typeform") {
      window.location.href = "/api/integrations/typeform/oauth/start";
      return;
    }
    if (integration.provider === "manychat") {
      setManychatConnectOpen(true);
      return;
    }
    if (integration.provider === "discord") {
      startDiscordOAuth();
      return;
    }
    setConnectOpen(false);
    setSyncing(true);
    setStatus("syncing");
    push({ title: es.flow.integrationConnected, description: es.common.loading });
    window.setTimeout(() => {
      setSyncing(false);
      setStatus("connected");
      push({
        title: es.flow.integrationConnected,
        description: es.flow.integrationConnectedDesc,
        variant: "success",
      });
    }, 1200);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <IntegrationLogo provider={integration.provider} />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base leading-snug">
                  {integration.name}
                </CardTitle>
                <Badge variant={statusVariant} className="shrink-0">
                  {comingSoon ? COMING_SOON_LABEL : STATUS_LABEL[status]}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {integration.description ? (
            <p className="text-xs text-muted-foreground">{integration.description}</p>
          ) : null}
          {integration.provider === "instagram" && (
            <p className="text-xs text-muted-foreground">
              Conectá tu Instagram para visualizar el rendimiento de tu contenido y su
              impacto en conversaciones, agendamientos y ventas.
            </p>
          )}
          {integration.provider === "manychat" && status === "not_connected" && (
            <p className="text-xs text-muted-foreground">
              Conecta con tu API key. Los mensajes nuevos llegan vía External Request;
              también puedes importar contactos por subscriber ID.
            </p>
          )}
          {integration.provider === "manychat" &&
            status === "connected" &&
            manychatWebhookUrl && (
              <ManyChatWebhookNotice webhookUrl={manychatWebhookUrl} />
            )}
          {integration.provider === "calendly" && status === "not_connected" && (
            <p className="text-xs text-muted-foreground">
              Conecta tu cuenta de Calendly para importar llamadas de cierre. Si no
              tienes plan Standard, después de conectar deberás sincronizar manualmente
              desde esta pantalla.
            </p>
          )}
          {integration.provider === "calendly" &&
            status === "connected" &&
            !calendlyWebhookEnabled && <CalendlyManualSyncNotice />}
          {integration.provider === "fathom" && status === "not_connected" && (
            <p className="text-xs text-muted-foreground">
              Conectá con tu API key personal. Encontrala en fathom.video/settings/api.
            </p>
          )}
          {integration.provider === "youtube" && (
            <p className="text-xs text-muted-foreground">
              Conectá tu canal para métricas de contenido y etiquetado IA.
            </p>
          )}
          {integration.provider === "typeform" && (
            <p className="text-xs text-muted-foreground">
              Conectá Typeform para métricas, respuestas y lead scoring.
            </p>
          )}
          {integration.provider === "google_forms" && (
            <p className="text-xs text-muted-foreground">
              Conectá Google (Forms + Drive + YouTube en un solo OAuth) para
              formularios, respuestas y contenido de canal.
            </p>
          )}
          {integration.provider === "miro" && (
            <p className="text-xs text-muted-foreground">
              Importa tableros con vista previa para la base de conocimiento.
            </p>
          )}
          {integration.provider === "discord" && status === "not_connected" && (
            <p className="text-xs text-muted-foreground">
              Invitá el bot a tu servidor para capturar conversaciones con
              clientes y detectar testimonios automáticamente.
            </p>
          )}
          {integration.provider === "discord" && status === "connected" && (
            <p className="text-xs text-muted-foreground">
              {integration.recordsSynced != null && integration.recordsSynced > 0
                ? `${integration.recordsSynced.toLocaleString("es")} mensajes capturados`
                : "Servidor conectado — configurá canales en Gestionar"}
              {integration.lastSync
                ? ` · Última actividad: ${integration.lastSync}`
                : ""}
            </p>
          )}
          {integration.lastSync && status === "connected" && (
            <p className="text-xs text-muted-foreground">
              Última sync: {integration.lastSync}
              {integration.recordsSynced != null &&
                ` · ${integration.recordsSynced.toLocaleString("es")} registros`}
            </p>
          )}
          {syncing && (
            <p className="text-xs text-warning">Sincronizando datos…</p>
          )}
          {status === "connected" && googleProvider ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                type="button"
                disabled={syncing}
                onClick={() => startGoogleOAuth(googleProvider)}
              >
                Reconectar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                type="button"
                disabled={syncing}
                onClick={() => handleDisconnectGoogle(googleProvider)}
              >
                Desconectar
              </Button>
            </div>
          ) : comingSoon ? (
            <Button variant="outline" size="sm" className="w-full" type="button" disabled>
              {COMING_SOON_LABEL} — Phase 2
            </Button>
          ) : integration.provider === "instagram" && status === "not_connected" ? (
            <Button asChild variant="default" size="sm" className="w-full">
              <a href={INSTAGRAM_CONNECT_URL}>{es.common.connect}</a>
            </Button>
          ) : (
          <Button
            variant={status === "not_connected" ? "default" : "outline"}
            size="sm"
            className="w-full"
            type="button"
            disabled={syncing}
            onClick={async () => {
              if (integration.provider === "fathom" && status === "not_connected") {
                setFathomConnectOpen(true);
                return;
              }

              if (integration.provider === "fathom" && status === "connected") {
                setSyncing(true);
                try {
                  const result = await syncFathomMeetingsAction();
                  if (!result.success) {
                    push({
                      title: "Error al sincronizar Fathom",
                      description: result.error,
                    });
                    return;
                  }
                  router.refresh();
                  push({
                    title: "Fathom sincronizado",
                    description: `${result.data.synced} reunión${result.data.synced === 1 ? "" : "es"} importada${result.data.synced === 1 ? "" : "s"}`,
                    variant: "success",
                  });
                } catch (e) {
                  push({
                    title: "Error al sincronizar Fathom",
                    description:
                      e instanceof Error ? e.message : "Error desconocido",
                  });
                } finally {
                  setSyncing(false);
                }
                return;
              }

              if (integration.provider === "manychat") {
                if (status === "not_connected") {
                  setManychatConnectOpen(true);
                } else {
                  setManychatImportOpen(true);
                }
                return;
              }

              if (integration.provider === "discord" && status === "not_connected") {
                startDiscordOAuth();
                return;
              }

              if (integration.provider === "discord" && status === "connected") {
                router.push(paths.platform.integrationsDiscord);
                return;
              }

              if (integration.provider === "calendly" && status === "not_connected") {
                window.location.href = "/api/integrations/calendly/oauth/start";
                return;
              }

              if (integration.provider === "instagram" && status === "connected") {
                setSyncing(true);
                try {
                  const result = await syncInstagramContentAction();
                  if (!result.success) {
                    push({
                      title: "Error al sincronizar Instagram",
                      description: result.error,
                    });
                    return;
                  }
                  setInstagramConnected(true);
                  router.refresh();
                  push({
                    title: "Instagram sincronizado",
                    description: `${result.data.synced} pieza${result.data.synced === 1 ? "" : "s"} actualizada${result.data.synced === 1 ? "" : "s"}`,
                    variant: "success",
                  });
                } catch (e) {
                  push({
                    title: "Error al sincronizar Instagram",
                    description:
                      e instanceof Error ? e.message : "Error desconocido",
                  });
                } finally {
                  setSyncing(false);
                }
                return;
              }

              if (integration.provider === "calendly" && status === "connected") {
                setSyncing(true);
                try {
                  const result = await pullCalendlyScheduledEventsAction();
                  if (!result.success) {
                    push({
                      title: "Error al sincronizar Calendly",
                      description: result.error,
                    });
                    return;
                  }
                  const { fetched, inserted, updated } = result.data;
                  await refreshClosingCalls();
                  setStatus("connected");
                  router.refresh();
                  push({
                    title: "Calendly sincronizado",
                    description: `${fetched} eventos · ${inserted} nuevos · ${updated} actualizados`,
                    variant: "success",
                  });
                } catch (e) {
                  push({
                    title: "Error al sincronizar Calendly",
                    description:
                      e instanceof Error ? e.message : "Error desconocido",
                  });
                } finally {
                  setSyncing(false);
                }
                return;
              }

              if (status === "not_connected") {
                if (integration.provider === "instagram") {
                  window.location.href = INSTAGRAM_CONNECT_URL;
                  return;
                }
                setConnectOpen(true);
              } else {
                push({
                  title: integration.name,
                  description: "Opciones de configuración disponibles próximamente.",
                });
              }
            }}
          >
            {syncing
              ? es.status.integration.syncing
              : status === "not_connected"
                ? es.common.connect
                : integration.provider === "calendly" ||
                    integration.provider === "fathom" ||
                    integration.provider === "instagram"
                  ? "Sincronizar ahora"
                  : integration.provider === "manychat"
                    ? "Importar contacto"
                    : integration.provider === "discord"
                      ? "Gestionar"
                      : es.common.manage}
          </Button>
          )}
        </CardContent>
      </Card>

      <FathomConnectDialog
        open={fathomConnectOpen}
        onOpenChange={setFathomConnectOpen}
        onConnected={() => setStatus("connected")}
      />
      <ManyChatConnectDialog
        open={manychatConnectOpen}
        onOpenChange={setManychatConnectOpen}
        onConnected={() => setStatus("connected")}
      />
      <ManyChatImportDialog
        open={manychatImportOpen}
        onOpenChange={setManychatImportOpen}
      />

      {integration.provider !== "instagram" ? (
        <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Conectar {integration.name}</DialogTitle>
              <DialogDescription>
                Flujo simulado — en producción se abrirá OAuth o API key.
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              La IA indexará conversaciones, transcripciones y documentos para el
              Contexto de negocio y los reportes ejecutivos.
            </p>
            <DialogFooter>
              <Button variant="ghost" type="button" onClick={() => setConnectOpen(false)}>
                {es.common.cancel}
              </Button>
              <Button type="button" onClick={handleConnect}>
                {es.common.connect}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}
