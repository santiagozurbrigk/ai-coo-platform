"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button, cn } from "@ai-coo/ui";
import type { IntegrationProvider } from "@/constants/integrations";
import type { IntegrationState } from "@/lib/integrations/health";
import { getIntegrationDefinition } from "@/lib/integrations/registry";
import { useToast } from "@/providers/toast-provider";
import { usePlatformData } from "@/providers";
import {
  disconnectCalendlyAction,
  disconnectFathomAction,
  disconnectGHLIntegrationAction,
  disconnectGoogleIntegrationAction,
  disconnectManyChatAction,
  disconnectTypeformAction,
  disconnectZernioAction,
} from "@/app/integrations/actions";
import { disconnectYoutubeAction } from "@/app/youtube/actions";
import { pullCalendlyScheduledEventsAction } from "@/app/calendly/actions";
import { syncFathomMeetingsAction } from "@/app/fathom/actions";
import { getManyChatIntegrationStatusAction } from "@/app/manychat/actions";
import { FathomConnectDialog } from "./fathom-connect-dialog";
import { ManyChatConnectDialog } from "./manychat-connect-dialog";
import { ManyChatImportDialog } from "./manychat-import-dialog";
import { ManyChatManageSheet } from "./manychat-manage-sheet";
import { ZernioConnectModal } from "./zernio-connect-modal";
import { ClickUpImportWizard } from "./clickup-import-wizard";
import { YoutubeApiKeyDialog } from "./youtube-api-key-dialog";
import { GoogleEcosystemConnectDialog } from "./google-ecosystem-connect-dialog";
import { GHLConnectDialog } from "./ghl-connect-dialog";

/**
 * Conectar, sincronizar y desconectar, decidido por el registro.
 *
 * Reemplaza el bloque de ~400 líneas de `integration-card.tsx`, que resolvía lo
 * mismo con dos cascadas de `if (provider === …)` **duplicadas**: `handleConnect`
 * y `handlePrimaryAction` listaban los mismos proveedores con ramas parecidas
 * pero no iguales, y la primera era en la práctica inalcanzable salvo desde el
 * diálogo "flujo simulado".
 *
 * Ese flujo simulado —un `setTimeout` de 1200 ms que ponía la tarjeta en
 * "Conectado" sin conectar nada— se eliminó: era código de maqueta corriendo en
 * producción para cualquier proveedor sin flujo real.
 */

/** Desconexión por proveedor. Si no está acá, no se ofrece desconectar. */
const DISCONNECT: Partial<
  Record<
    IntegrationProvider,
    () => Promise<{ success: boolean; error?: string }>
  >
> = {
  calendly: disconnectCalendlyAction,
  fathom: disconnectFathomAction,
  ghl: disconnectGHLIntegrationAction,
  manychat: disconnectManyChatAction,
  typeform: disconnectTypeformAction,
  youtube: disconnectYoutubeAction,
  zernio: disconnectZernioAction,
  google_ecosystem: () => disconnectGoogleIntegrationAction("google_forms"),
};

/**
 * Sincronización manual. Sólo los proveedores donde traer datos a mano tiene
 * sentido: los demás llegan por webhook o por cron, y un botón que no hace nada
 * es peor que no tener botón.
 */
const MANUAL_SYNC: Partial<
  Record<
    IntegrationProvider,
    {
      label: string;
      run: () => Promise<{ success: boolean; error?: string; data?: unknown }>;
    }
  >
> = {
  calendly: {
    label: "Traer turnos ahora",
    run: pullCalendlyScheduledEventsAction,
  },
  fathom: { label: "Traer reuniones ahora", run: syncFathomMeetingsAction },
};

export function IntegrationConnectActions({
  provider,
  state,
}: {
  provider: IntegrationProvider;
  state: IntegrationState;
}) {
  const definition = getIntegrationDefinition(provider);
  const router = useRouter();
  const { push } = useToast();
  const { refreshClosingCalls } = usePlatformData();
  const [isPending, startTransition] = useTransition();
  const [manychatWebhookUrl, setManychatWebhookUrl] = useState<string | null>(
    null,
  );
  const [openDialog, setOpenDialog] = useState<
    | "fathom"
    | "manychat"
    | "manychat_manage"
    | "manychat_import"
    | "zernio"
    | "clickup"
    | "youtube"
    | "google"
    | "ghl"
    | null
  >(null);

  const isConnected = state !== "not_connected";
  const disconnect = DISCONNECT[provider];
  const manualSync = MANUAL_SYNC[provider];

  function openConnectSurface() {
    if (definition.connect === "redirect" && definition.connectUrl) {
      window.location.href = definition.connectUrl;
      return;
    }

    switch (provider) {
      case "fathom":
        return setOpenDialog("fathom");
      case "manychat":
        if (!isConnected) return setOpenDialog("manychat");
        // La URL del webhook se pide recién al abrir: contiene el token de la
        // organización y no hace falta traerla al pintar el grid.
        void getManyChatIntegrationStatusAction()
          .then((status) => setManychatWebhookUrl(status.webhookUrl ?? null))
          .catch(() => setManychatWebhookUrl(null));
        return setOpenDialog("manychat_manage");
      case "zernio":
        return setOpenDialog("zernio");
      case "ghl":
        return setOpenDialog("ghl");
      case "youtube":
        return setOpenDialog("youtube");
      case "google_ecosystem":
        return setOpenDialog("google");
      case "clickup":
        return setOpenDialog("clickup");
      default:
        return undefined;
    }
  }

  function handleSync() {
    if (!manualSync) return;
    startTransition(async () => {
      const result = await manualSync.run();
      if (!result.success) {
        push({
          title: `No se pudo sincronizar ${definition.name}`,
          description: result.error,
        });
        return;
      }
      if (provider === "calendly") await refreshClosingCalls();
      push({ title: `${definition.name} sincronizado`, variant: "success" });
      router.refresh();
    });
  }

  function handleDisconnect() {
    if (!disconnect) return;
    startTransition(async () => {
      const result = await disconnect();
      if (!result.success) {
        push({
          title: "No se pudo desconectar",
          description: result.error,
        });
        return;
      }
      push({ title: `${definition.name} desconectado`, variant: "success" });
      router.refresh();
    });
  }

  // Los proveedores que se configuran en el propio panel traen su formulario de
  // conexión adentro: no necesitan botón acá.
  const showConnectButton = definition.connect !== "panel";

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {showConnectButton ? (
          <Button size="sm" disabled={isPending} onClick={openConnectSurface}>
            {definition.auth === "import"
              ? "Importar clientes"
              : isConnected
                ? "Reconfigurar"
                : `Conectar ${definition.name}`}
          </Button>
        ) : null}

        {isConnected && manualSync ? (
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={handleSync}
          >
            <RefreshCw
              className={cn("mr-2 h-3.5 w-3.5", isPending && "animate-spin")}
            />
            {manualSync.label}
          </Button>
        ) : null}

        {isConnected && disconnect ? (
          <Button
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={handleDisconnect}
            className="text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
          >
            Desconectar
          </Button>
        ) : null}
      </div>

      <FathomConnectDialog
        open={openDialog === "fathom"}
        onOpenChange={(open: boolean) => setOpenDialog(open ? "fathom" : null)}
        onConnected={() => router.refresh()}
      />
      <ManyChatConnectDialog
        open={openDialog === "manychat"}
        onOpenChange={(open: boolean) =>
          setOpenDialog(open ? "manychat" : null)
        }
        onConnected={() => router.refresh()}
      />
      <ManyChatManageSheet
        open={openDialog === "manychat_manage"}
        onOpenChange={(open: boolean) =>
          setOpenDialog(open ? "manychat_manage" : null)
        }
        webhookUrl={manychatWebhookUrl}
        onImportContact={() => setOpenDialog("manychat_import")}
      />
      <ManyChatImportDialog
        open={openDialog === "manychat_import"}
        onOpenChange={(open: boolean) =>
          setOpenDialog(open ? "manychat_import" : null)
        }
      />
      <ZernioConnectModal
        open={openDialog === "zernio"}
        onOpenChange={(open: boolean) => setOpenDialog(open ? "zernio" : null)}
        onConnected={() => router.refresh()}
      />
      <ClickUpImportWizard
        open={openDialog === "clickup"}
        onOpenChange={(open: boolean) => setOpenDialog(open ? "clickup" : null)}
      />
      <YoutubeApiKeyDialog
        open={openDialog === "youtube"}
        onOpenChange={(open: boolean) => setOpenDialog(open ? "youtube" : null)}
        onConnected={() => router.refresh()}
      />
      <GoogleEcosystemConnectDialog
        open={openDialog === "google"}
        onOpenChange={(open: boolean) => setOpenDialog(open ? "google" : null)}
      />
      <GHLConnectDialog
        open={openDialog === "ghl"}
        onOpenChange={(open: boolean) => setOpenDialog(open ? "ghl" : null)}
        onConnected={() => router.refresh()}
      />
    </>
  );
}
