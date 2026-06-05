"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  connectFathomAction,
  type FathomConnectState,
} from "@/app/fathom/actions";
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

const initialState: FathomConnectState = {};

type FathomConnectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected?: () => void;
};

export function FathomConnectDialog({
  open,
  onOpenChange,
  onConnected,
}: FathomConnectDialogProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    connectFathomAction,
    initialState
  );

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
          <DialogTitle>Conectar Fathom</DialogTitle>
          <DialogDescription>
            Encontrá tu API key en{" "}
            <a
              href="https://fathom.video/settings/api"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2"
            >
              fathom.video/settings/api
            </a>
            . La usamos para importar transcripts y seguimiento de clientes.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fathom-api-key">API Key de Fathom</Label>
            <Input
              id="fathom-api-key"
              name="apiKey"
              type="password"
              autoComplete="off"
              placeholder="Pega tu API key"
              required
            />
          </div>

          {state.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}
          {state.success && (
            <p className="text-sm text-emerald-400" role="status">
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
