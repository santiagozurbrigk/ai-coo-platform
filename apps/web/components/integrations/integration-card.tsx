"use client";

import { useRouter } from "next/navigation";
import { getCurrentUserIdAction } from "@/app/auth/current-user-actions";
import { paths } from "@/routes";
import { useEffect, useState } from "react";
import {
  disconnectCalendlyAction,
  disconnectFathomAction,
  disconnectGoogleIntegrationAction,
  disconnectInstagramAction,
  disconnectManyChatAction,
  disconnectTypeformAction,
  disconnectZernioAction,
} from "@/app/integrations/actions";
import { disconnectDiscordIntegrationAction } from "@/app/discord/actions";
import { disconnectUnipileIntegrationAction } from "@/app/unipile/actions";
import { disconnectYoutubeAction } from "@/app/youtube/actions";
import {
  getCalendlyIntegrationStatusAction,
  pullCalendlyScheduledEventsAction,
} from "@/app/calendly/actions";
import { syncFathomMeetingsAction } from "@/app/fathom/actions";
import { syncInstagramContentAction, syncInstagramMessagesAction } from "@/app/instagram/actions";
import { getManyChatIntegrationStatusAction } from "@/app/manychat/actions";
import {
  GOOGLE_OAUTH_START_URL,
  googleOAuthProviderForCard,
  isGoogleIntegrationProvider,
  type GoogleIntegrationProvider,
} from "@/lib/google/oauth-paths";
import { INTEGRATION_DESCRIPTIONS } from "@/lib/integrations/integration-groups";
import {
  Button,
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
import type { IntegrationCardStatus } from "./integration-status-badge";
import { FathomConnectDialog } from "./fathom-connect-dialog";
import { FathomMemberAccountsSection } from "./fathom-member-accounts";
import { ManyChatConnectDialog } from "./manychat-connect-dialog";
import { ManyChatImportDialog } from "./manychat-import-dialog";
import { IntegrationCardShell } from "./integration-card-shell";
import { IntegrationLogo } from "./integration-logo";
import { ManyChatManageSheet } from "./manychat-manage-sheet";
import { ZernioConnectModal } from "./zernio-connect-modal";
import { ClickUpImportWizard } from "./clickup-import-wizard";
import { YoutubeApiKeyDialog } from "./youtube-api-key-dialog";
import { GoogleEcosystemConnectDialog } from "./google-ecosystem-connect-dialog";

const COMING_SOON_LABEL = "Próximamente";

const INSTAGRAM_CONNECT_URL = "/api/integrations/instagram/connect";

function unipileProviderFromIntegration(
  provider: Integration["provider"]
): "whatsapp" | null {
  if (provider === "unipile_whatsapp") return "whatsapp";
  return null;
}

function formatLastSync(integration: Integration, status: string): string | undefined {
  if (status !== "connected") return undefined;

  const parts: string[] = [];
  if (integration.lastSync) {
    parts.push(integration.lastSync);
  }
  if (integration.recordsSynced != null && integration.recordsSynced > 0) {
    parts.push(
      `${integration.recordsSynced.toLocaleString("es")} registros`
    );
  }
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

export function IntegrationCard({ integration }: { integration: Integration }) {
  const router = useRouter();
  const [status, setStatus] = useState(integration.status);
  const [calendlyWebhookEnabled, setCalendlyWebhookEnabled] = useState(true);
  const [connectOpen, setConnectOpen] = useState(false);
  const [fathomConnectOpen, setFathomConnectOpen] = useState(false);
  const [manychatConnectOpen, setManychatConnectOpen] = useState(false);
  const [manychatImportOpen, setManychatImportOpen] = useState(false);
  const [manychatManageOpen, setManychatManageOpen] = useState(false);
  const [googleManageOpen, setGoogleManageOpen] = useState(false);
  const [instagramManageOpen, setInstagramManageOpen] = useState(false);
  const [zernioConnectOpen, setZernioConnectOpen] = useState(false);
  const [clickupImportOpen, setClickupImportOpen] = useState(false);
  const [youtubeApiKeyOpen, setYoutubeApiKeyOpen] = useState(false);
  const [googleEcosystemOpen, setGoogleEcosystemOpen] = useState(false);
  const [manychatWebhookUrl, setManychatWebhookUrl] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const { push } = useToast();
  const { setInstagramConnected } = useMarketingData();
  const { refreshClosingCalls } = usePlatformData();

  useEffect(() => {
    setStatus(integration.status);
  }, [integration.status]);

  useEffect(() => {
    if (integration.provider !== "fathom") return;
    void getCurrentUserIdAction()
      .then(setCurrentUserId)
      .catch(() => setCurrentUserId(null));
  }, [integration.provider]);

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

  const googleProvider = isGoogleIntegrationProvider(integration.provider)
    ? googleOAuthProviderForCard(integration.provider)
    : null;

  const startGoogleOAuth = (provider: GoogleIntegrationProvider) => {
    window.location.href = GOOGLE_OAUTH_START_URL[provider];
  };

  const startUnipileConnect = async (provider: "whatsapp") => {
    setSyncing(true);
    try {
      const res = await fetch(
        `/api/integrations/unipile/connect?provider=${provider}`
      );
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        push({
          title: "No se pudo conectar Unipile",
          description: data.error ?? "Error desconocido",
          variant: "default",
        });
        return;
      }
      window.location.href = data.url;
    } finally {
      setSyncing(false);
    }
  };

  const startDiscordOAuth = () => {
    // Redirige al start route del servidor que genera state + cookie antes de ir a Discord
    window.location.href = "/api/integrations/discord/oauth/start";
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
      setGoogleManageOpen(false);
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

  const handleDisconnect = async () => {
    const disconnectActions: Partial<
      Record<Integration["provider"], () => Promise<{ success: boolean; error?: string }>>
    > = {
      instagram: disconnectInstagramAction,
      fathom: disconnectFathomAction,
      manychat: disconnectManyChatAction,
      calendly: disconnectCalendlyAction,
      typeform: disconnectTypeformAction,
      discord: disconnectDiscordIntegrationAction,
      zernio: disconnectZernioAction,
      youtube: disconnectYoutubeAction,
    };

    const unipileProvider = unipileProviderFromIntegration(integration.provider);
    if (unipileProvider) {
      setSyncing(true);
      try {
        const res = await disconnectUnipileIntegrationAction(unipileProvider);
        if (!res.success) {
          push({ title: res.error ?? "Error al desconectar", variant: "default" });
          return;
        }
        setStatus("not_connected");
        router.refresh();
        push({
          title: `${integration.name} desconectado`,
          variant: "success",
        });
      } finally {
        setSyncing(false);
      }
      return;
    }

    const action = disconnectActions[integration.provider];
    if (!action) return;

    setSyncing(true);
    try {
      const res = await action();
      if (!res.success) {
        push({ title: res.error ?? "Error al desconectar", variant: "default" });
        return;
      }

      setStatus("not_connected");
      if (integration.provider === "instagram") {
        setInstagramConnected(false);
      }
      if (integration.provider === "manychat") {
        setManychatManageOpen(false);
        setManychatWebhookUrl(null);
      }
      router.refresh();
      push({
        title: `${integration.name} desconectado`,
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
    if (integration.provider === "zernio") {
      setZernioConnectOpen(true);
      return;
    }
    if (integration.provider === "clickup") {
      setClickupImportOpen(true);
      return;
    }
    const unipileProvider = unipileProviderFromIntegration(integration.provider);
    if (unipileProvider) {
      void startUnipileConnect(unipileProvider);
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

  const handleManage = async () => {
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
          description: e instanceof Error ? e.message : "Error desconocido",
        });
      } finally {
        setSyncing(false);
      }
      return;
    }

    if (integration.provider === "manychat" && status === "connected") {
      setManychatManageOpen(true);
      return;
    }

    if (integration.provider === "discord" && status === "connected") {
      router.push(paths.platform.integrationsDiscord);
      return;
    }

    if (integration.provider === "instagram" && status === "connected") {
      setInstagramManageOpen(true);
      return;
    }

    if (integration.provider === "zernio" && status === "connected") {
      setZernioConnectOpen(true);
      return;
    }

    if (integration.provider === "clickup") {
      setClickupImportOpen(true);
      return;
    }

    const unipileProvider = unipileProviderFromIntegration(integration.provider);
    if (unipileProvider && status === "connected") {
      void startUnipileConnect(unipileProvider);
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
          description: e instanceof Error ? e.message : "Error desconocido",
        });
      } finally {
        setSyncing(false);
      }
      return;
    }

    if (status === "connected" && googleProvider) {
      setGoogleManageOpen(true);
      return;
    }

    push({
      title: integration.name,
      description: "Opciones de configuración disponibles próximamente.",
    });
  };

  const handlePrimaryAction = () => {
    if (comingSoon) return;

    if (status === "not_connected") {
      if (integration.provider === "fathom") {
        setFathomConnectOpen(true);
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
      if (integration.provider === "calendly") {
        window.location.href = "/api/integrations/calendly/oauth/start";
        return;
      }
      if (integration.provider === "instagram") {
        window.location.href = INSTAGRAM_CONNECT_URL;
        return;
      }
      if (integration.provider === "youtube") {
        setYoutubeApiKeyOpen(true);
        return;
      }
      if (integration.provider === "google_ecosystem") {
        setGoogleEcosystemOpen(true);
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
      if (integration.provider === "zernio") {
        setZernioConnectOpen(true);
        return;
      }
      if (integration.provider === "clickup") {
        setClickupImportOpen(true);
        return;
      }
      const unipileProvider = unipileProviderFromIntegration(integration.provider);
      if (unipileProvider) {
        void startUnipileConnect(unipileProvider);
        return;
      }
      setConnectOpen(true);
      return;
    }

    if (integration.provider === "youtube" && status === "connected") {
      setYoutubeApiKeyOpen(true);
      return;
    }

    handleManage();
  };

  const isConnected = status === "connected";
  const cardStatus: IntegrationCardStatus = syncing || status === "syncing"
    ? "syncing"
    : (status as IntegrationCardStatus);

  const supportsCardDisconnect =
    isConnected &&
    !comingSoon &&
    (integration.provider === "instagram" ||
      integration.provider === "unipile_whatsapp" ||
      integration.provider === "fathom" ||
      integration.provider === "manychat" ||
      integration.provider === "calendly" ||
      integration.provider === "typeform" ||
      integration.provider === "discord" ||
      integration.provider === "zernio" ||
      integration.provider === "youtube");

  const description =
    integration.description ??
    INTEGRATION_DESCRIPTIONS[integration.provider] ??
    "";

  const actionLabel = comingSoon
    ? COMING_SOON_LABEL
    : syncing
      ? es.status.integration.syncing
      : !isConnected
        ? integration.provider === "clickup"
          ? "Importar clientes"
          : es.common.connect
        : integration.provider === "clickup"
          ? "Importar clientes"
          : integration.provider === "calendly" ||
            integration.provider === "fathom" ||
            integration.provider === "instagram" ||
            integration.provider === "zernio" ||
            integration.provider === "unipile_whatsapp"
          ? "Gestionar"
          : es.common.manage;

  const calendlyManualHint =
    integration.provider === "calendly" &&
    isConnected &&
    !calendlyWebhookEnabled
      ? " Sin plan Standard, sincronizá manualmente."
      : "";

  return (
    <div className="flex flex-col">
      <IntegrationCardShell
        name={integration.name}
        description={`${description}${calendlyManualHint}`}
        icon={
          integration.provider === "zernio" ? (
            <div className="relative shrink-0">
              <IntegrationLogo provider="zernio" size="sm" />
              <div className="absolute -bottom-1 -right-1 flex items-center gap-px">
                <IntegrationLogo provider="instagram" size="xs" className="!h-4 !w-4 !rounded-md ring-1 ring-background" />
                <IntegrationLogo provider="unipile_whatsapp" size="xs" className="!h-4 !w-4 !rounded-md ring-1 ring-background" />
              </div>
            </div>
          ) : (
            <IntegrationLogo provider={integration.provider} size="sm" />
          )
        }
        status={comingSoon ? "not_connected" : cardStatus}
        lastSync={formatLastSync(integration, status)}
        actionLabel={actionLabel}
        actionDisabled={comingSoon || syncing}
        onConnect={handlePrimaryAction}
        onManage={handlePrimaryAction}
        onDisconnect={supportsCardDisconnect ? handleDisconnect : undefined}
        disconnectDisabled={syncing}
      />

      {integration.provider === "fathom" &&
      status === "connected" &&
      currentUserId ? (
        <FathomMemberAccountsSection currentUserId={currentUserId} />
      ) : null}

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
      <ManyChatManageSheet
        open={manychatManageOpen}
        onOpenChange={setManychatManageOpen}
        webhookUrl={manychatWebhookUrl}
        onImportContact={() => {
          setManychatManageOpen(false);
          setManychatImportOpen(true);
        }}
      />
      <ZernioConnectModal
        open={zernioConnectOpen}
        onOpenChange={setZernioConnectOpen}
        onConnected={() => {
          setStatus("connected");
          router.refresh();
        }}
      />
      <ClickUpImportWizard
        open={clickupImportOpen}
        onOpenChange={setClickupImportOpen}
      />

      {googleProvider ? (
        <Dialog open={googleManageOpen} onOpenChange={setGoogleManageOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gestionar {integration.name}</DialogTitle>
              <DialogDescription>
                Reconectá para actualizar permisos o desconectá la integración.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                type="button"
                disabled={syncing}
                onClick={() => {
                  setGoogleManageOpen(false);
                  if (integration.provider === "google_ecosystem") {
                    setGoogleEcosystemOpen(true);
                  } else {
                    startGoogleOAuth(googleProvider);
                  }
                }}
              >
                Reconectar
              </Button>
              <Button
                variant="outline"
                type="button"
                disabled={syncing}
                onClick={() => handleDisconnectGoogle(googleProvider)}
              >
                Desconectar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}

      {integration.provider === "instagram" ? (
        <Dialog open={instagramManageOpen} onOpenChange={setInstagramManageOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gestionar Instagram</DialogTitle>
              <DialogDescription>
                Sincronizá contenido para Marketing o importá DMs al inbox de
                ventas. Los mensajes también se actualizan cada 5 minutos
                automáticamente.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                type="button"
                disabled={syncing}
                onClick={async () => {
                  setSyncing(true);
                  try {
                    const result = await syncInstagramContentAction();
                    if (!result.success) {
                      push({
                        title: "Error al sincronizar contenido",
                        description: result.error,
                      });
                      return;
                    }
                    setInstagramConnected(true);
                    router.refresh();
                    push({
                      title: "Contenido sincronizado",
                      description: `${result.data.synced} pieza${result.data.synced === 1 ? "" : "s"} actualizada${result.data.synced === 1 ? "" : "s"}`,
                      variant: "success",
                    });
                  } finally {
                    setSyncing(false);
                  }
                }}
              >
                Sincronizar contenido
              </Button>
              <Button
                type="button"
                disabled={syncing}
                onClick={async () => {
                  setSyncing(true);
                  try {
                    const result = await syncInstagramMessagesAction();
                    if (!result.success) {
                      push({
                        title: "Error al sincronizar mensajes",
                        description: result.error,
                      });
                      return;
                    }
                    router.refresh();
                    push({
                      title: "Mensajes sincronizados",
                      description:
                        "Los DMs de Instagram se importaron al inbox de ventas.",
                      variant: "success",
                    });
                    setInstagramManageOpen(false);
                  } finally {
                    setSyncing(false);
                  }
                }}
              >
                Sincronizar mensajes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}

      <YoutubeApiKeyDialog
        open={youtubeApiKeyOpen}
        onOpenChange={setYoutubeApiKeyOpen}
        onConnected={() => setStatus("connected")}
      />
      <GoogleEcosystemConnectDialog
        open={googleEcosystemOpen}
        onOpenChange={setGoogleEcosystemOpen}
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
    </div>
  );
}
