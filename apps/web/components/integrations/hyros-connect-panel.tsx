"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Info, RefreshCw, Target } from "lucide-react";
import { Button, Input, Label, cn } from "@ai-coo/ui";
import {
  connectHyrosAction,
  disconnectHyrosAction,
  setHyrosAdAccountActiveAction,
  setHyrosAttributionModelAction,
  syncHyrosAdAccountsAction,
  type HyrosStatus,
} from "@/app/hyros/actions";
import { useToast } from "@/providers/toast-provider";

const MODELS = [
  { value: "last_click", label: "Último click", hint: "Atribuye al último anuncio antes de la venta" },
  { value: "first_click", label: "Primer click", hint: "Atribuye al anuncio que trajo al lead" },
  { value: "scientific", label: "Científico", hint: "Ventana de primera atribución configurable" },
] as const;

/**
 * Conexión de Hyros — unidad I-8.
 *
 * Hyros es el dueño de la atribución según el documento fuente. Dos cosas que el
 * panel tiene que dejar claras:
 *
 * 1. **Sus números no coinciden con los de Meta ni con los de la pasarela, y eso
 *    está bien.** El documento lo dice explícitamente. Por eso el ROAS by-source
 *    se calcula entero con datos de Hyros.
 * 2. **El modelo de atribución cambia los números.** No es una preferencia de
 *    visualización: son respuestas distintas a la misma pregunta.
 */
export function HyrosConnectPanel({ status }: { status: HyrosStatus }) {
  const router = useRouter();
  const { push } = useToast();
  const [isPending, startTransition] = useTransition();
  const [apiKey, setApiKey] = useState("");
  const [accountId, setAccountId] = useState("");

  function handleConnect() {
    startTransition(async () => {
      const result = await connectHyrosAction(apiKey, {
        accessibleAccountId: accountId.trim() || undefined,
      });
      if (!result.success) {
        push({ title: "No se pudo conectar Hyros", description: result.error });
        return;
      }
      setApiKey("");
      setAccountId("");
      push({
        title: "Hyros conectado",
        description: `${result.data.adAccounts} cuentas publicitarias`,
        variant: "success",
      });
      router.refresh();
    });
  }

  function handleSync() {
    startTransition(async () => {
      const result = await syncHyrosAdAccountsAction();
      if (!result.success) {
        push({ title: "No se pudieron sincronizar las cuentas", description: result.error });
        return;
      }
      push({
        title: "Cuentas sincronizadas",
        description: `${result.data.adAccounts} cuentas publicitarias`,
        variant: "success",
      });
      router.refresh();
    });
  }

  function handleModel(model: (typeof MODELS)[number]["value"]) {
    startTransition(async () => {
      const result = await setHyrosAttributionModelAction(model);
      if (!result.success) {
        push({ title: "No se pudo cambiar el modelo", description: result.error });
        return;
      }
      push({
        title: "Modelo de atribución cambiado",
        description: "Los números del período se recalculan con el modelo nuevo.",
        variant: "success",
      });
      router.refresh();
    });
  }

  function handleToggleAccount(externalId: string, isActive: boolean) {
    startTransition(async () => {
      const result = await setHyrosAdAccountActiveAction(externalId, isActive);
      if (!result.success) {
        push({ title: "No se pudo actualizar la cuenta", description: result.error });
        return;
      }
      router.refresh();
    });
  }

  function handleDisconnect() {
    startTransition(async () => {
      const result = await disconnectHyrosAction();
      if (!result.success) {
        push({ title: "No se pudo desconectar", description: result.error });
        return;
      }
      push({ title: "Hyros desconectado", variant: "success" });
      router.refresh();
    });
  }

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-medium">Hyros</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Atribución real: qué anuncio causó cada venta. De acá sale el ROAS por fuente,
          que es distinto del ROAS general — y esa diferencia es el dato.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 dark:border-glass dark:bg-glass">
        {!status.connected ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="hyros-api-key" className="text-xs">
                API key
              </Label>
              <Input
                id="hyros-api-key"
                type="password"
                autoComplete="off"
                value={apiKey}
                placeholder="La key de la cuenta de Hyros del negocio"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hyros-account-id" className="text-xs">
                ID de cuenta accesible <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Input
                id="hyros-account-id"
                value={accountId}
                placeholder="Sólo si la key es de una agencia"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccountId(e.target.value)}
              />
            </div>
            <Button size="sm" disabled={isPending || !apiKey.trim()} onClick={handleConnect}>
              Conectar Hyros
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1 text-xs">
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  <Target className="h-4 w-4 text-primary" />
                  {status.adAccounts.length} cuentas publicitarias
                </p>
                <p className="text-muted-foreground">
                  {status.adAccountsSyncedAt
                    ? `Actualizado el ${new Date(status.adAccountsSyncedAt).toLocaleString("es-AR")}`
                    : "Todavía no se sincronizaron las cuentas."}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={isPending} onClick={handleSync}>
                  <RefreshCw className={cn("mr-2 h-4 w-4", isPending && "animate-spin")} />
                  Sincronizar
                </Button>
                <Button variant="outline" size="sm" disabled={isPending} onClick={handleDisconnect}>
                  Desconectar
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium">Modelo de atribución</p>
              <p className="text-xs text-muted-foreground">
                Cambia los números, no la presentación: cada modelo responde una pregunta
                distinta sobre el mismo período.
              </p>
              <div className="flex flex-wrap gap-2">
                {MODELS.map((model) => (
                  <button
                    key={model.value}
                    type="button"
                    disabled={isPending}
                    onClick={() => handleModel(model.value)}
                    title={model.hint}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs transition-colors",
                      status.attributionModel === model.value
                        ? "border-primary bg-primary/10 font-medium text-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {model.label}
                  </button>
                ))}
              </div>
            </div>

            {status.adAccounts.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-medium">Cuentas que entran en los totales</p>
                <div className="space-y-1.5">
                  {status.adAccounts.map((account) => (
                    <label
                      key={account.externalId}
                      className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={account.isActive}
                        disabled={isPending}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleToggleAccount(account.externalId, e.target.checked)
                        }
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {account.name ?? account.externalId}
                      </span>
                      {account.accountType ? (
                        <span className="text-muted-foreground">{account.accountType}</span>
                      ) : null}
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <p className="inline-flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Sin cuentas publicitarias sincronizadas no se puede pedir ningún reporte:
                la API de Hyros exige nombrarlas.
              </p>
            )}

            <p className="inline-flex items-start gap-1.5 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Los números de Hyros no van a coincidir con los de Meta ni con los de la
              pasarela de pagos, y no es un error: miden cosas distintas. Por eso el módulo
              los muestra por separado y etiquetados.
            </p>

            {status.lastError ? (
              <p className="inline-flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Último error: {status.lastError}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
