"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy } from "lucide-react";
import { Button, Input, Label } from "@ai-coo/ui";
import {
  connectPaymentProviderAction,
  disconnectPaymentProviderAction,
  type PaymentIntegrationStatus,
} from "@/app/payments/actions";
import { useToast } from "@/providers/toast-provider";

/**
 * Configuración de un proveedor de cobros.
 *
 * El flujo tiene **dos lados** y por eso no alcanza con pegar un secreto: OTC lo
 * guarda, y el proveedor tiene que apuntar sus webhooks a la URL que se muestra
 * después de conectar. Sin ese segundo paso no llega ningún evento, y la
 * integración se ve conectada igual — que es exactamente lo que la incidencia
 * "todavía no llegó ningún evento" viene a decir.
 *
 * Los textos de ayuda salen de la documentación capturada en
 * `docs/external-apis/{whop,commas}/RESUMEN-OTC.md`, no de memoria. Dos detalles
 * que estaban mal antes y la doc corrige:
 *
 * - El secreto de Whop empieza con **`ws_`**, no con `whsec_`. La doc es
 *   explícita: se pasa tal cual, sin sacarle el prefijo ni decodificarlo.
 * - **Fanbasis se llama Commas**, y su documentación vigente está en
 *   `commasdocs.com`; `apidocs.fan` es la vieja. El API se sigue sirviendo desde
 *   `fanbasis.com`, así que el identificador interno no cambia.
 */
const PROVIDER_INFO = {
  whop: {
    label: "Whop",
    secretHint:
      "Whop lo muestra una sola vez, al crear el webhook. Empieza con ws_ — pegalo entero, sin sacarle el prefijo.",
    docsUrl: "https://docs.whop.com/developer/guides/webhooks",
    docsLabel: "Guía de webhooks de Whop",
  },
  fanbasis: {
    label: "Commas",
    secretHint:
      "Commas lo entrega al configurar el webhook en su panel, en Webhook subscriptions.",
    docsUrl: "https://commasdocs.com/webhooks",
    docsLabel: "Guía de webhooks de Commas",
  },
} as const;

export function PaymentSettings({
  integration,
}: {
  integration: PaymentIntegrationStatus;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [isPending, startTransition] = useTransition();
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
        push({
          title: `No se pudo conectar ${info.label}`,
          description: result.error,
        });
        return;
      }

      setWebhookSecret("");
      setApiKey("");
      push({
        title: `${info.label} conectado`,
        description: "Falta registrar la URL del webhook en su panel.",
        variant: "success",
      });
      router.refresh();
    });
  }

  function handleDisconnect() {
    startTransition(async () => {
      const result = await disconnectPaymentProviderAction(
        integration.provider,
      );
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
      push({ title: "No se pudo copiar", description: "Copiala manualmente." });
    }
  }

  if (!integration.connected) {
    return (
      <form onSubmit={handleConnect} className="space-y-4">
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setApiKey(e.target.value)
            }
            placeholder="••••••••"
            autoComplete="off"
          />
          <p className="text-[11px] text-muted-foreground">
            Todavía no se usa. Va a hacer falta para importar los cobros
            anteriores a la conexión, que los dos proveedores exponen por API.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="submit"
            size="sm"
            disabled={isPending || !webhookSecret.trim()}
          >
            {isPending ? "Conectando…" : `Conectar ${info.label}`}
          </Button>
          <a
            href={info.docsUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            {info.docsLabel}
          </a>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      {integration.webhookUrl ? (
        <div>
          <Label className="text-xs">URL del webhook</Label>
          <div className="mt-1 flex gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg border border-border bg-muted/40 px-2.5 py-1.5 text-[11px]">
              {integration.webhookUrl}
            </code>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyWebhookUrl}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            Registrala en el panel de {info.label}. Hasta que lo hagas no llega
            ningún evento.
          </p>
        </div>
      ) : null}

      <p className="text-xs text-muted-foreground">
        {integration.lastEventAt
          ? `Último evento: ${new Date(integration.lastEventAt).toLocaleString("es-AR")}`
          : "Todavía no llegó ningún evento."}
      </p>

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
  );
}
