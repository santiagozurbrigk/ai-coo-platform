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
import { TempCredentialsDialog } from "@/components/shared/temp-credentials-dialog";
import type { TempCredentials } from "@/lib/auth/temp-credentials";
import type { HoldingBillingModel } from "@/lib/holding/billing";

type AddBusinessModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billingModel: HoldingBillingModel | null;
  onSuccess?: () => void;
};

export function AddBusinessModal({
  open,
  onOpenChange,
  billingModel,
  onSuccess,
}: AddBusinessModalProps) {
  const [businessName, setBusinessName] = useState("");
  const [revenueSharePct, setRevenueSharePct] = useState("20");
  const [fixedFeeAmount, setFixedFeeAmount] = useState("");
  const [fixedFeeCurrency, setFixedFeeCurrency] = useState<"USD" | "ARS">("USD");
  const [createFounder, setCreateFounder] = useState(false);
  const [founderEmail, setFounderEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [tempCredentials, setTempCredentials] = useState<TempCredentials | null>(
    null
  );
  const [pending, startTransition] = useTransition();

  function resetForm() {
    setBusinessName("");
    setRevenueSharePct("20");
    setFixedFeeAmount("");
    setFixedFeeCurrency("USD");
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
        revenueSharePct:
          billingModel === "revenue_share"
            ? Number(revenueSharePct)
            : undefined,
        fixedFeeAmount:
          billingModel === "fixed_fee" ? Number(fixedFeeAmount) : undefined,
        fixedFeeCurrency:
          billingModel === "fixed_fee" ? fixedFeeCurrency : undefined,
        founderEmail:
          createFounder && founderEmail.trim() ? founderEmail.trim() : undefined,
      });
      if (!res.success) {
        setError(res.error);
        return;
      }
      handleOpenChange(false);
      if (res.data.tempCredentials) {
        setTempCredentials(res.data.tempCredentials);
      }
      onSuccess?.();
    });
  }

  return (
    <>
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

            {billingModel === "fixed_fee" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fixed-fee">Tarifa fija mensual</Label>
                  <Input
                    id="fixed-fee"
                    type="number"
                    min={0}
                    step={0.01}
                    value={fixedFeeAmount}
                    onChange={(e) => setFixedFeeAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fixed-currency">Moneda</Label>
                  <select
                    id="fixed-currency"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={fixedFeeCurrency}
                    onChange={(e) =>
                      setFixedFeeCurrency(e.target.value as "USD" | "ARS")
                    }
                  >
                    <option value="USD">USD</option>
                    <option value="ARS">ARS</option>
                  </select>
                </div>
              </div>
            ) : (
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
            )}

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

            <Button
              type="submit"
              disabled={pending || !billingModel}
              className="w-full"
            >
              {pending ? "Creando negocio…" : "Agregar negocio"}
            </Button>

            <p className="text-xs text-muted-foreground">
              Si creás el usuario del founder, copiá las credenciales temporales
              y compartilas manualmente. Deberá cambiar la contraseña al ingresar.
            </p>
          </form>
        </DialogContent>
      </Dialog>
      {tempCredentials && (
        <TempCredentialsDialog
          open
          onClose={() => setTempCredentials(null)}
          email={tempCredentials.email}
          tempPassword={tempCredentials.tempPassword}
        />
      )}
    </>
  );
}
