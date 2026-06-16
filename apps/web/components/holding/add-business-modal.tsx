"use client";

import { useState, useTransition } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@ai-coo/ui";
import { addBusinessToMyHoldingAction } from "@/app/(platform)/holding/actions";

type AddBusinessModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function AddBusinessModal({
  open,
  onOpenChange,
  onSuccess,
}: AddBusinessModalProps) {
  const [businessName, setBusinessName] = useState("");
  const [revenueSharePct, setRevenueSharePct] = useState("20");
  const [createFounder, setCreateFounder] = useState(false);
  const [founderEmail, setFounderEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function resetForm() {
    setBusinessName("");
    setRevenueSharePct("20");
    setCreateFounder(false);
    setFounderEmail("");
    setError(null);
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) resetForm();
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await addBusinessToMyHoldingAction({
        businessName,
        revenueSharePct: Number(revenueSharePct),
        founderEmail:
          createFounder && founderEmail.trim() ? founderEmail.trim() : undefined,
      });
      if (!res.success) {
        setError(res.error);
        return;
      }
      handleOpenChange(false);
      onSuccess?.();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar negocio al holding</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business-name">Nombre del negocio</Label>
            <Input
              id="business-name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Ej: Agencia de Marketing de Juan"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="revenue-share">Tu % de revenue share</Label>
            <div className="flex items-center gap-2">
              <Input
                id="revenue-share"
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={revenueSharePct}
                onChange={(e) => setRevenueSharePct(e.target.value)}
                required
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Porcentaje del revenue que te corresponde
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={createFounder}
              onChange={(e) => setCreateFounder(e.target.checked)}
              className="rounded border-input"
            />
            Crear usuario para el founder
          </label>

          {createFounder && (
            <div className="space-y-2">
              <Label htmlFor="founder-email">Email del founder</Label>
              <Input
                id="founder-email"
                type="email"
                value={founderEmail}
                onChange={(e) => setFounderEmail(e.target.value)}
                placeholder="founder@empresa.com"
                required={createFounder}
              />
            </div>
          )}

          {!createFounder && (
            <p className="text-xs text-muted-foreground">
              Si lo dejás vacío, podés agregar el founder después. Igual podés
              entrar al negocio desde tu holding.
            </p>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Creando negocio…" : "Agregar negocio"}
          </Button>

          <p className="text-xs text-muted-foreground">
            Si creás el usuario del founder, recibirá un email con credenciales
            temporales para acceder al software.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
