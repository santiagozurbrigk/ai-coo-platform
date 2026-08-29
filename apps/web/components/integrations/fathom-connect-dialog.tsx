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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@ai-coo/ui";
import { es } from "@/lib/locale/es";
import { brand } from "@/lib/brand";

const initialState: FathomConnectState = {};

const STEPS = [
  <>
    Ir a{" "}
    <a
      href="https://fathom.video/api_settings/new"
      target="_blank"
      rel="noreferrer"
      className="text-brand-600 underline underline-offset-2 dark:text-brand-400"
    >
      fathom.video/api_settings/new
    </a>
  </>,
  <>
    Click en <strong className="text-foreground/80">Add API Connection</strong>
  </>,
  <>
    Seleccionar{" "}
    <strong className="text-foreground/80">Generate API Key</strong> (para uso
    personal e interno)
  </>,
  <>
    Poné el nombre <strong className="text-foreground/80">{brand.name} Platform</strong> y
    generá la key
  </>,
  <>Copiar la API key y pegarla abajo</>,
] as const;

function StepNumber({ n }: { n: number }) {
  return (
    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-[10px] font-bold text-brand-600 dark:text-brand-400">
      {n}
    </span>
  );
}

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
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="mb-1 rounded-xl border border-border bg-muted/10 p-4 dark:border-white/8 dark:bg-white/3">
            <p className="mb-3 text-xs font-medium text-muted-foreground">
              Cómo obtener tu API key:
            </p>
            <ol className="space-y-2">
              {STEPS.map((content, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-xs text-muted-foreground"
                >
                  <StepNumber n={index + 1} />
                  <span>{content}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fathom-api-key">API Key de Fathom</Label>
            <Input
              id="fathom-api-key"
              name="apiKey"
              type="password"
              autoComplete="off"
              placeholder="fathom_xxxxxxxxxxxxxxxx"
              required
            />
            <p className="text-[10px] text-muted-foreground/70">
              Tu API key se guarda de forma segura y nunca se comparte.
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
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              {es.common.cancel}
            </Button>
            <Button type="submit" className="flex-1" disabled={pending}>
              {pending ? "Conectando…" : "Conectar Fathom"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
