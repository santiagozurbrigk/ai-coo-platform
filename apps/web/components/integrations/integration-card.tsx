"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { disconnectGoogleIntegrationAction } from "@/app/integrations/actions";
import {
  getCalendlyIntegrationStatusAction,
  pullCalendlyScheduledEventsAction,
} from "@/app/calendly/actions";
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
import { ManyChatConnectDialog } from "./manychat-connect-dialog";
import { ManyChatImportDialog } from "./manychat-import-dialog";
import { ManyChatWebhookNotice } from "./manychat-webhook-notice";

const STATUS_LABEL: Record<string, string> = {
  connected: es.status.integration.connected,
  not_connected: es.status.integration.not_connected,
  syncing: es.status.integration.syncing,
};

export function IntegrationCard({ integration }: { integration: Integration }) {
  const router = useRouter();
  const [status, setStatus] = useState(integration.status);
  const [calendlyWebhookEnabled, setCalendlyWebhookEnabled] = useState(true);
  const [connectOpen, setConnectOpen] = useState(false);
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

  const statusVariant =
    status === "connected"
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
    if (integration.provider === "calendly") {
      window.location.href = "/api/integrations/calendly/oauth/start";
      return;
    }
    if (integration.provider === "fathom") {
      window.location.href = "/api/integrations/fathom/oauth/start";
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

    setConnectOpen(false);
    setSyncing(true);
    setStatus("syncing");
    push({ title: es.flow.integrationConnected, description: es.common.loading });
    window.setTimeout(() => {
      setSyncing(false);
      setStatus("connected");
      if (integration.provider === "instagram") {
        setInstagramConnected(true);
      }
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
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{integration.name}</CardTitle>
            <Badge variant={statusVariant}>{STATUS_LABEL[status]}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
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
          {integration.provider === "fathom" && (
            <p className="text-xs text-muted-foreground">
              Conectá Fathom para importar transcripts y seguimiento automático de clientes.
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
          ) : (
          <Button
            variant={status === "not_connected" ? "default" : "outline"}
            size="sm"
            className="w-full"
            type="button"
            disabled={syncing}
            onClick={async () => {
              if (integration.provider === "manychat") {
                if (status === "not_connected") {
                  setManychatConnectOpen(true);
                } else {
                  setManychatImportOpen(true);
                }
                return;
              }

              if (integration.provider === "calendly" && status === "not_connected") {
                window.location.href = "/api/integrations/calendly/oauth/start";
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
                setConnectOpen(true);
              } else {
                push({
                  title: integration.name,
                  description: "Configuración de integración — prototipo.",
                });
              }
            }}
          >
            {syncing
              ? es.status.integration.syncing
              : status === "not_connected"
                ? es.common.connect
                : integration.provider === "calendly"
                  ? "Sincronizar ahora"
                  : integration.provider === "manychat"
                    ? "Importar contacto"
                    : es.common.manage}
          </Button>
          )}
        </CardContent>
      </Card>

      <ManyChatConnectDialog
        open={manychatConnectOpen}
        onOpenChange={setManychatConnectOpen}
        onConnected={() => setStatus("connected")}
      />
      <ManyChatImportDialog
        open={manychatImportOpen}
        onOpenChange={setManychatImportOpen}
      />

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
    </>
  );
}
