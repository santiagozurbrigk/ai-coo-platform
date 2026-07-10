"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  connectZernioAction,
  getZernioIntegrationStatusAction,
  refreshZernioAccountsAction,
  type ZernioConnectState,
  type ZernioIntegrationStatus,
} from "@/app/integrations/zernio/actions";
import { ZERNIO_API_KEYS_URL } from "@/lib/zernio/constants";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@ai-coo/ui";
import { es } from "@/lib/locale/es";
import { useToast } from "@/providers/toast-provider";

const initialState: ZernioConnectState = {};

export function ZernioConnectModal({
  open,
  onOpenChange,
  onConnected,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected?: () => void;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [status, setStatus] = useState<ZernioIntegrationStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [state, formAction, pending] = useActionState(
    connectZernioAction,
    initialState
  );

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

  useEffect(() => {
    if (!state.success) return;
    onConnected?.();
    void loadStatus();
    onOpenChange(false);
    const timer = window.setTimeout(() => router.refresh(), 300);
    return () => window.clearTimeout(timer);
  }, [state.success, onConnected, loadStatus, onOpenChange, router]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await refreshZernioAccountsAction();
      await loadStatus();
      onConnected?.();
      router.refresh();
      push({
        title: "Cuentas actualizadas",
        description: "Sincronizamos los canales de tu cuenta Zernio.",
        variant: "success",
      });
    } catch (error) {
      push({
        title: "Error al actualizar",
        description: error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      setRefreshing(false);
    }
  }

  const isConnected = status?.connected ?? false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Conectar Zernio</DialogTitle>
          <DialogDescription>
            Zernio unifica Instagram Direct y WhatsApp en un solo inbox. Una sola
            API key conecta ambos canales.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="py-4 text-sm text-muted-foreground">Cargando…</p>
        ) : isConnected ? (
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-sm">
              <p className="font-medium text-foreground">Zernio — Conectado</p>
              {status?.accountName ? (
                <p className="mt-1 text-muted-foreground">
                  Cuenta: {status.accountName}
                </p>
              ) : null}
              <p className="mt-2 text-xs text-muted-foreground">
                Canales activos: {status?.channelsLabel}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">📷 Instagram Direct</Badge>
              <Badge variant={status?.hasWhatsapp ? "secondary" : "outline"}>
                💬{" "}
                {status?.hasWhatsapp
                  ? "WhatsApp"
                  : "WhatsApp: no configurado en Zernio"}
              </Badge>
            </div>

            {status?.connectedAccounts.length ? (
              <ul className="space-y-2">
                {status.connectedAccounts.map((account) => (
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
            ) : (
              <p className="text-sm text-muted-foreground">
                La API key es válida, pero no encontramos cuentas vinculadas en
                Zernio. Configurá Instagram o WhatsApp en tu dashboard de Zernio
                y luego actualizá.
              </p>
            )}

            <DialogFooter className="px-0">
              <Button
                type="button"
                variant="outline"
                disabled={refreshing}
                onClick={() => void handleRefresh()}
              >
                {refreshing ? "Actualizando…" : "Actualizar cuentas"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form action={formAction} className="space-y-4 py-2">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">¿Dónde encontrar tu API key?</p>
              <p>
                Zernio dashboard → API Keys → copiar la key.{" "}
                <a
                  href={ZERNIO_API_KEYS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Abrir API Keys en Zernio
                </a>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zernio-api-key">API key de Zernio</Label>
              <Input
                id="zernio-api-key"
                name="apiKey"
                type="password"
                autoComplete="off"
                placeholder="Pega tu API key de Zernio aquí"
                required
              />
            </div>

            <div className="rounded-lg border border-dashed border-border/60 bg-muted/10 p-3 text-sm">
              <p className="mb-2 font-medium text-foreground">
                Canales que se activarán con esta conexión
              </p>
              <ul className="space-y-1 text-muted-foreground">
                <li>📷 Instagram Direct ✓</li>
                <li>💬 WhatsApp ✓ (si está habilitado en tu cuenta Zernio)</li>
              </ul>
            </div>

            {state.error ? (
              <p className="text-sm text-destructive" role="alert">
                {state.error}
              </p>
            ) : null}
            {state.success ? (
              <p className="text-sm text-emerald-600 dark:text-emerald-400" role="status">
                {state.success}
              </p>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                {es.common.cancel}
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Conectando…" : es.common.connect}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
