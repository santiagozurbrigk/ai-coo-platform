"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, cn } from "@ai-coo/ui";
import {
  completeHoldingOnboardingAction,
  getHoldingOnboardingStateAction,
  saveHoldingBillingModelAction,
} from "@/app/(platform)/onboarding/holding/actions";
import { fetchOnboardingStatus } from "@/lib/onboarding/onboarding-status";
import type { HoldingBillingModel } from "@/lib/holding/billing";
import { paths } from "@/routes";

type BusinessDraft = {
  id: string;
  name: string;
  revenueSharePct: string;
  fixedFeeAmount: string;
  fixedFeeCurrency: "USD" | "ARS";
};

function emptyBusiness(): BusinessDraft {
  return {
    id: crypto.randomUUID(),
    name: "",
    revenueSharePct: "20",
    fixedFeeAmount: "",
    fixedFeeCurrency: "USD",
  };
}

function BillingOptionCard({
  title,
  description,
  selected,
  onClick,
}: {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border p-5 text-left transition-all",
        selected
          ? "border-primary bg-primary/10 shadow-[0_0_24px_hsl(var(--ai)/0.12)]"
          : "border-border/60 bg-muted/10 hover:border-primary/40"
      )}
    >
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </button>
  );
}

export function HoldingOnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [billingModel, setBillingModel] = useState<HoldingBillingModel | null>(
    null
  );
  const [businesses, setBusinesses] = useState<BusinessDraft[]>([
    emptyBusiness(),
  ]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    void (async () => {
      const status = await fetchOnboardingStatus();
      if (status.completed) {
        router.replace(paths.platform.holding);
        return;
      }
      if (status.accountType !== "holding") {
        router.replace(paths.auth.onboarding);
        return;
      }

      const state = await getHoldingOnboardingStateAction();
      if (state.billingModel) {
        setBillingModel(state.billingModel);
        setStep(2);
      }
      setLoading(false);
    })();
  }, [router]);

  function continueToBusinesses() {
    if (!billingModel) {
      setError("Elegí un modelo de cobro");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await saveHoldingBillingModelAction(billingModel);
      if (!res.ok) {
        setError("No se pudo guardar el modelo de cobro");
        return;
      }
      setStep(2);
    });
  }

  function updateBusiness(id: string, patch: Partial<BusinessDraft>) {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b))
    );
  }

  function removeBusiness(id: string) {
    setBusinesses((prev) =>
      prev.length <= 1 ? prev : prev.filter((b) => b.id !== id)
    );
  }

  function finish() {
    setError(null);
    startTransition(async () => {
      try {
        await completeHoldingOnboardingAction({
          businesses: businesses.map((b) => ({
            name: b.name,
            revenueSharePct:
              billingModel === "revenue_share"
                ? Number(b.revenueSharePct)
                : undefined,
            fixedFeeAmount:
              billingModel === "fixed_fee"
                ? Number(b.fixedFeeAmount)
                : undefined,
            fixedFeeCurrency:
              billingModel === "fixed_fee" ? b.fixedFeeCurrency : undefined,
          })),
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al finalizar");
      }
    });
  }

  if (loading) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Cargando…
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <div className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Paso {step} de 2
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {step === 1
            ? "¿Cómo cobrás a los negocios de tu holding?"
            : "Agregá los negocios que gestionás"}
        </h1>
        {step === 2 && (
          <p className="text-sm text-muted-foreground">
            Vas a poder agregar más después desde tu panel
          </p>
        )}
      </div>

      {step === 1 ? (
        <div className="space-y-4">
          <BillingOptionCard
            title="Porcentaje del revenue"
            description="Cobro un % de lo que factura cada negocio"
            selected={billingModel === "revenue_share"}
            onClick={() => setBillingModel("revenue_share")}
          />
          <BillingOptionCard
            title="Tarifa fija"
            description="Cobro un monto fijo mensual por negocio"
            selected={billingModel === "fixed_fee"}
            onClick={() => setBillingModel("fixed_fee")}
          />
          <p className="text-xs text-muted-foreground">
            Define qué campo se pide al agregar cada negocio. Podés cambiarlo
            después desde la configuración del holding.
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="button"
            className="w-full"
            disabled={!billingModel || pending}
            onClick={continueToBusinesses}
          >
            {pending ? "Guardando…" : "Continuar"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {businesses.map((business) => (
            <div
              key={business.id}
              className="space-y-4 rounded-xl border border-border/60 p-5"
            >
              <div className="space-y-2">
                <Label>Nombre del negocio</Label>
                <Input
                  value={business.name}
                  onChange={(e) =>
                    updateBusiness(business.id, { name: e.target.value })
                  }
                  placeholder="Ej: Academia de Juan"
                  required
                />
              </div>

              {billingModel === "revenue_share" ? (
                <div className="space-y-2">
                  <Label>% que te corresponde</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={0.01}
                      value={business.revenueSharePct}
                      onChange={(e) =>
                        updateBusiness(business.id, {
                          revenueSharePct: e.target.value,
                        })
                      }
                      className="w-28"
                      required
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Monto fijo mensual</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={business.fixedFeeAmount}
                      onChange={(e) =>
                        updateBusiness(business.id, {
                          fixedFeeAmount: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Moneda</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={business.fixedFeeCurrency}
                      onChange={(e) =>
                        updateBusiness(business.id, {
                          fixedFeeCurrency: e.target.value as "USD" | "ARS",
                        })
                      }
                    >
                      <option value="USD">USD</option>
                      <option value="ARS">ARS</option>
                    </select>
                  </div>
                </div>
              )}

              {businesses.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBusiness(business.id)}
                >
                  Eliminar
                </Button>
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setBusinesses((prev) => [...prev, emptyBusiness()])}
          >
            + Agregar otro negocio
          </Button>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              disabled={pending}
            >
              Volver
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={pending}
              onClick={finish}
            >
              {pending ? "Finalizando…" : "Finalizar configuración"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
