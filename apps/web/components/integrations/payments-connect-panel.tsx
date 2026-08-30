"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Copy, Wallet } from "lucide-react";
import { Button, Input, Label, cn } from "@ai-coo/ui";
import {
  connectPaymentProviderAction,
  disconnectPaymentProviderAction,
  type PaymentIntegrationStatus,
} from "@/app/payments/actions";
import { useToast } from "@/providers/toast-provider";

const PROVIDER_INFO = {
  whop: {
    label: "Whop",
    description:
      "Checkout y membresías. Alimenta la etapa Cash del embudo: AOV, cash collected y reembolsos.",
    secretHint: "Whop lo muestra al crear el webhook. Suele empezar con whsec_",
    docsUrl: "https://docs.whop.com/developer/guides/webhooks",
  },
  fanbasis: {
    label: "Fanbasis",
    description:
      "Checkout high-ticket con planes de pago. Misma función que Whop para la etapa Cash.",
    secretHint: "Fanbasis lo entrega al configurar el webhook en su panel",
    docsUrl: "https://apidocs.fan/",
  },
} as const;

/**
 * Conexión de los proveedores de pago que el documento fuente asigna a la etapa
 * Cash (§05: "Whop / Fanbasis — AOV, cash collected, refunds").
 *
 * El flujo tiene dos lados y por eso no alcanza con pegar una key: OTC guarda el
 * secreto, y el proveedor tiene que apuntar sus webhooks a la URL que se muestra
 * después de conectar. Sin ese segundo paso no llega ningún evento.
 */
export function PaymentsConnectPanel({
  integrations,
}: {
  integrations: PaymentIntegrationStatus[];
}) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-medium">Pagos</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          De acá salen el cash collected, el valor contratado y los reembolsos de todos
          los embudos.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {integrations.map((integration) => (
          <PaymentProviderCard key={integration.provider} integration={integration} />
        ))}
      </div>
    </section>
  );
}

function PaymentProviderCard({
  integration,
}: {
  integration: PaymentIntegrationStatus;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);
  const [webhookSecret, setWebhookSecret] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [copied, setCopied] = useState(false);

  const info = PROVIDER_INFO[integration.provider];

  function handleConnect(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const result = await connectPaymentProviderAction({
        provider: integration.provider,
        apiKey,
        webhookSecret,
      });

      if (!result.ok) {
        push({ title: `No se pudo conectar ${info.label}`, description: result.error });
        return;
      }

      setWebhookSecret("");
      setApiKey("");
      setExpanded(false);
      push({
        title: `${info.label} conectado`,
        description: "Falta registrar la URL del webhook en su panel",
        variant: "success",
      });
      router.refresh();
    });
  }

  function handleDisconnect() {
    startTransition(async () => {
      const result = await disconnectPaymentProviderAction(integration.provider);
      if (!result.ok) {
        push({ title: "No se pudo desconectar", description: result.error });
        return;
      }
      push({ title: `${info.label} desconectado` });
      router.refresh();
    });
  }

  async function copyWebhookUrl() {
    if (!integration.webhookUrl) return;
    try {
      await navigator.clipboard.writeText(integration.webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      push({ title: "No se pudo copiar", description: "Copiala manualmente" });
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 dark:border-glass dark:bg-glass">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Wallet className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium">{info.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{info.description}</p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
            integration.connected
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-muted text-muted-foreground"
          )}
        >
          {integration.connected ? "Conectado" : "Sin conectar"}
        </span>
      </div>

      {integration.connected ? (
        <div className="mt-4 space-y-3">
          {integration.webhookUrl ? (
            <div>
              <Label className="text-xs">URL del webhook</Label>
              <div className="mt-1 flex gap-2">
                <code className="min-w-0 flex-1 truncate rounded-lg border border-border bg-muted/40 px-2.5 py-1.5 text-[11px]">
                  {integration.webhookUrl}
                </code>
                <Button type="button" variant="outline" size="sm" onClick={copyWebhookUrl}>
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Registrala en el panel de {info.label}. Hasta que lo hagas no llega ningún
                evento.
              </p>
            </div>
          ) : null}

          <p className="text-xs text-muted-foreground">
            {integration.lastEventAt
              ? `Último evento: ${new Date(integration.lastEventAt).toLocaleString("es-AR")}`
              : "Todavía no llegó ningún evento"}
          </p>

          {integration.unmappedEvents > 0 ? (
            <div className="flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2.5">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
              <p className="text-[11px] text-muted-foreground">
                <span className="font-medium text-foreground">
                  {integration.unmappedEvents} evento(s) sin interpretar.
                </span>{" "}
                Llegaron y están guardados, pero su formato todavía no se sabe leer. No se
                perdió nada: se reprocesan cuando se ajuste el mapeo.
              </p>
            </div>
          ) : null}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            disabled={isPending}
          >
            Desconectar
          </Button>
        </div>
      ) : expanded ? (
        <form onSubmit={handleConnect} className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor={`${integration.provider}-secret`} className="text-xs">
              Secreto del webhook <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`${integration.provider}-secret`}
              type="password"
              value={webhookSecret}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setWebhookSecret(e.target.value)
              }
              placeholder="••••••••"
              autoComplete="off"
            />
            <p className="text-[11px] text-muted-foreground">{info.secretHint}</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${integration.provider}-key`} className="text-xs">
              API key <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id={`${integration.provider}-key`}
              type="password"
              value={apiKey}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)}
              placeholder="••••••••"
              autoComplete="off"
            />
            <p className="text-[11px] text-muted-foreground">
              Todavía no se usa. Va a hacer falta para importar el histórico previo a la
              conexión.
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isPending || !webhookSecret.trim()}>
              {isPending ? "Conectando…" : "Conectar"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setExpanded(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-4"
          onClick={() => setExpanded(true)}
        >
          Conectar
        </Button>
      )}
    </div>
  );
}
