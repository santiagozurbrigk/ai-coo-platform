"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getZernioConnectUrlAction,
  getZernioIntegrationStatusAction,
  refreshZernioAccountsAction,
  type ZernioIntegrationStatus,
} from "@/app/integrations/zernio/actions";
import type { ZernioConnectedAccount } from "@/lib/zernio/integration";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ai-coo/ui";
import { useToast } from "@/providers/toast-provider";

const ZERNIO_PLATFORMS = [
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "telegram", label: "Telegram" },
  { id: "twitter", label: "Twitter / X" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "youtube", label: "YouTube" },
  { id: "tiktok", label: "TikTok" },
  { id: "reddit", label: "Reddit" },
  { id: "bluesky", label: "Bluesky" },
  { id: "threads", label: "Threads" },
  { id: "pinterest", label: "Pinterest" },
] as const;

export function ZernioConnectModal({
  open,
  onOpenChange,
  onConnected,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected?: () => void;
}) {
  const { push } = useToast();
  const [status, setStatus] = useState<ZernioIntegrationStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const next = await getZernioIntegrationStatusAction();
      setStatus(next);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void loadStatus();
  }, [open, loadStatus]);

  async function handleConnect(platform: string) {
    setConnectingPlatform(platform);
    try {
      const { authUrl } = await getZernioConnectUrlAction(platform);
      window.open(authUrl, "_blank", "noopener,noreferrer");
      push({
        title: "Continuá en Zernio",
        description:
          "Completá la autorización en la nueva pestaña y luego actualizá las cuentas.",
      });
    } catch (err) {
      push({
        title: "No se pudo conectar",
        description: err instanceof Error ? err.message : "Error desconocido",
      });
    } finally {
      setConnectingPlatform(null);
    }
  }

  async function handleRefresh() {
    setLoading(true);
    try {
      const { connectedAccounts } = await refreshZernioAccountsAction();
      setStatus({
        connected: connectedAccounts.length > 0,
        profileId: status?.profileId ?? null,
        connectedAccounts,
      });
      if (connectedAccounts.length > 0) {
        onConnected?.();
      }
      push({
        title: "Cuentas actualizadas",
        description: `${connectedAccounts.length} cuenta${connectedAccounts.length === 1 ? "" : "s"} conectada${connectedAccounts.length === 1 ? "" : "s"}.`,
        variant: "success",
      });
    } catch (err) {
      push({
        title: "Error al actualizar",
        description: err instanceof Error ? err.message : "Error desconocido",
      });
    } finally {
      setLoading(false);
    }
  }

  const connectedAccounts = status?.connectedAccounts ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Conectar Zernio</DialogTitle>
          <DialogDescription>
            DMs, comentarios y analytics de Instagram, Facebook, WhatsApp y más
            plataformas vía OAuth oficial.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ZERNIO_PLATFORMS.map((platform) => (
              <Button
                key={platform.id}
                type="button"
                variant="outline"
                size="sm"
                disabled={loading || connectingPlatform === platform.id}
                onClick={() => void handleConnect(platform.id)}
              >
                {connectingPlatform === platform.id ? "Abriendo…" : platform.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">Cuentas conectadas</p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={loading}
              onClick={() => void handleRefresh()}
            >
              Actualizar cuentas
            </Button>
          </div>

          {connectedAccounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavía no hay cuentas vinculadas. Conectá una plataforma y luego
              actualizá.
            </p>
          ) : (
            <ul className="space-y-2">
              {connectedAccounts.map((account: ZernioConnectedAccount) => (
                <li
                  key={account.accountId}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {account.username ?? account.accountId}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {account.accountId}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 capitalize">
                    {account.platform}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
