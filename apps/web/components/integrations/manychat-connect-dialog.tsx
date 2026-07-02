"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  connectManyChatAction,
  type ManyChatConnectState,
} from "@/app/manychat/actions";
import {
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

const initialState: ManyChatConnectState = {};

type ManyChatConnectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected?: () => void;
};

export function ManyChatConnectDialog({
  open,
  onOpenChange,
  onConnected,
}: ManyChatConnectDialogProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(connectManyChatAction, initialState);

  useEffect(() => {
    if (!state.success) return;
    onConnected?.();
    onOpenChange(false);
    const t = window.setTimeout(() => router.refresh(), 300);
    return () => window.clearTimeout(t);
  }, [state.success, onConnected, onOpenChange, router]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Conectar ManyChat</DialogTitle>
          <DialogDescription>
            Genera tu API key en ManyChat → Settings → API. La usamos para validar tu
            cuenta y recibir mensajes vía webhook.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="manychat-api-token">API key</Label>
            <Input
              id="manychat-api-token"
              name="apiToken"
              type="password"
              autoComplete="off"
              placeholder="Pega tu API key"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="manychat-subscriber-id">
              Contacto de prueba (opcional)
            </Label>
            <Input
              id="manychat-subscriber-id"
              name="subscriberId"
              type="text"
              placeholder="Subscriber ID numérico o email"
            />
            <p className="text-xs text-muted-foreground">
              Lo ideal es el ID numérico de ManyChat (variable {"{{user_id}}"} en External
              Request).
              También puedes pegar un email si el contacto existe en ManyChat. Si falla la
              importación, la conexión igual se guarda.
            </p>
          </div>

          {state.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}
          {state.success && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400" role="status">
              {state.success}
            </p>
          )}

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
      </DialogContent>
    </Dialog>
  );
}
