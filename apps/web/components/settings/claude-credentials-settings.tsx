"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ExternalLink,
  KeyRound,
  Link2,
  Loader2,
  Sparkles,
  Unlink,
} from "lucide-react";
import { Badge, Button, Input, SectionHeader, SteppedAlert } from "@ai-coo/ui";
import {
  removeClaudeApiKeyAction,
  removeClaudeOAuthAction,
  saveClaudeApiKeyAction,
  type AiCredentialStatus,
} from "@/app/settings/actions";
import { FieldLabel } from "./field-label";
import { useToast } from "@/providers/toast-provider";

function formatDateTime(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function oauthBadge(status: AiCredentialStatus) {
  if (!status.oauth.connected) {
    return <Badge variant="secondary">No conectado</Badge>;
  }
  if (status.mode === "oauth_active") {
    return <Badge variant="success">Activo</Badge>;
  }
  if (status.mode === "oauth_degraded") {
    return <Badge variant="warning">Degradado</Badge>;
  }
  return <Badge variant="secondary">Conectado</Badge>;
}

function apiKeyBadge(status: AiCredentialStatus) {
  if (!status.apiKey.hasKey) {
    return <Badge variant="secondary">No configurado</Badge>;
  }
  if (status.mode === "oauth_degraded") {
    return <Badge variant="success">Activo (respaldo)</Badge>;
  }
  if (status.mode === "oauth_active") {
    return <Badge variant="secondary">Respaldo configurado</Badge>;
  }
  if (status.apiKey.status === "valid_no_credits") {
    return <Badge variant="warning">Sin créditos</Badge>;
  }
  return <Badge variant="success">Activo (principal)</Badge>;
}

export function ClaudeCredentialsSettings({
  initialStatus,
}: {
  initialStatus: AiCredentialStatus;
}) {
  const { push } = useToast();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState(initialStatus);
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [connectingKey, startConnectKey] = useTransition();
  const [removingKey, startRemoveKey] = useTransition();
  const [removingOAuth, startRemoveOAuth] = useTransition();

  useEffect(() => {
    const oauthResult = searchParams.get("claude_oauth");
    if (oauthResult === "success") {
      push({
        title: "Suscripción de Claude conectada",
        description: "Las funciones de IA usarán tu suscripción como credencial principal.",
        variant: "success",
      });
      setStatus((prev) => ({
        ...prev,
        mode: "oauth_active",
        oauth: {
          ...prev.oauth,
          connected: true,
          failedAt: null,
        },
      }));
    } else if (oauthResult === "error") {
      push({
        title: "No se pudo conectar Claude",
        description: "Verificá tu cuenta e intentá de nuevo.",
      });
    }
  }, [searchParams, push]);

  const handleConnectKey = () => {
    setError(null);
    startConnectKey(async () => {
      const result = await saveClaudeApiKeyAction(apiKey);
      if (!result.success) {
        setError(result.error);
        push({ title: "No se pudo conectar", description: result.error });
        return;
      }

      setApiKey("");
      const savedStatus = result.data?.status ?? "valid";
      setStatus((prev) => ({
        ...prev,
        apiKey: {
          hasKey: true,
          status: savedStatus,
          lastValidated: new Date().toISOString(),
          keyPreview: result.data?.maskedKey ?? null,
        },
      }));
      push({
        title: "API key conectada",
        description: "Quedó disponible como respaldo de IA.",
        variant: "success",
      });
    });
  };

  const handleRemoveKey = () => {
    if (
      !window.confirm(
        "¿Eliminar tu API key? Si tu suscripción OAuth falla, las funciones de IA pueden dejar de funcionar."
      )
    ) {
      return;
    }

    setError(null);
    startRemoveKey(async () => {
      const result = await removeClaudeApiKeyAction();
      if (!result.success) {
        setError(result.error);
        return;
      }

      setStatus((prev) => ({
        ...prev,
        apiKey: {
          hasKey: false,
          status: "none",
          lastValidated: null,
          keyPreview: null,
        },
      }));
      push({ title: "API key eliminada", variant: "success" });
    });
  };

  const handleRemoveOAuth = () => {
    if (!window.confirm("¿Desconectar tu suscripción de Claude?")) return;

    startRemoveOAuth(async () => {
      const result = await removeClaudeOAuthAction();
      if (!result.success) {
        push({ title: "Error", description: result.error });
        return;
      }

      setStatus((prev) => ({
        ...prev,
        mode: prev.apiKey.hasKey ? "api_key_active" : "api_key_active",
        oauth: {
          ...prev.oauth,
          connected: false,
          failedAt: null,
        },
      }));
      push({ title: "Suscripción desconectada", variant: "success" });
    });
  };

  const oauthFailedLabel = formatDateTime(status.oauth.failedAt);

  return (
    <section className="space-y-6">
      <SectionHeader
        icon={Sparkles}
        title="Credenciales de IA"
        variant="settings"
      />

      {/* Slot 1 — OAuth */}
      <div className="space-y-4 rounded-xl border border-border/60 bg-card/40 p-4 dark:border-glass dark:bg-glass">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-violet-400" />
            <p className="text-sm font-medium text-foreground">
              Claude OAuth (Suscripción)
            </p>
          </div>
          {oauthBadge(status)}
        </div>

        {!status.oauth.connectAvailable ? (
          <p className="text-sm text-muted-foreground">
            La conexión OAuth requiere credenciales de partner de Anthropic en
            este entorno. Usá una API key de respaldo mientras tanto.
          </p>
        ) : status.oauth.connected ? (
          <div className="space-y-3">
            {status.mode === "oauth_degraded" && oauthFailedLabel ? (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Último fallo: {oauthFailedLabel}
              </p>
            ) : null}
            {status.oauth.lastSuccessAt ? (
              <p className="text-xs text-muted-foreground">
                Última verificación exitosa:{" "}
                {formatDateTime(status.oauth.lastSuccessAt)}
              </p>
            ) : null}
            <Button
              type="button"
              variant="outline"
              className="border-red-500/40 text-red-400 hover:bg-red-500/10"
              disabled={removingOAuth}
              onClick={handleRemoveOAuth}
            >
              {removingOAuth ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Unlink className="mr-2 h-4 w-4" />
              )}
              Desconectar suscripción
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Conectá tu suscripción de Claude (Pro/Max) como credencial
              principal. Recomendamos también configurar una API key de
              respaldo.
            </p>
            <Button type="button" className="bg-violet-600 hover:bg-violet-700" asChild>
              <a href="/api/integrations/claude/oauth/start">
                Conectar con Claude
              </a>
            </Button>
          </div>
        )}
      </div>

      {/* Slot 2 — API Key */}
      <div className="space-y-4 rounded-xl border border-border/60 bg-card/40 p-4 dark:border-glass dark:bg-glass">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-violet-400" />
            <p className="text-sm font-medium text-foreground">
              API Key (Respaldo)
            </p>
          </div>
          {apiKeyBadge(status)}
        </div>

        {status.apiKey.hasKey ? (
          <div className="space-y-3">
            {status.apiKey.keyPreview ? (
              <p className="text-sm text-foreground">
                Tu API key:{" "}
                <span className="font-mono text-muted-foreground">
                  {status.apiKey.keyPreview}
                </span>
              </p>
            ) : null}
            {status.apiKey.status === "valid_no_credits" ? (
              <SteppedAlert
                variant="warning"
                title="Sin créditos en Anthropic"
                icon={<AlertTriangle className="h-4 w-4" />}
                action={
                  <Button size="sm" variant="outline" asChild>
                    <Link
                      href="https://console.anthropic.com/settings/billing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5"
                    >
                      Ir a billing
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                }
              >
                Tu API key es válida pero no tiene créditos cargados.
              </SteppedAlert>
            ) : null}
            {status.apiKey.lastValidated ? (
              <p className="text-xs text-muted-foreground">
                Validada el: {formatDateTime(status.apiKey.lastValidated)}
              </p>
            ) : null}
            <Button
              type="button"
              variant="outline"
              className="border-red-500/40 text-red-400 hover:bg-red-500/10"
              disabled={removingKey}
              onClick={handleRemoveKey}
            >
              {removingKey ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Eliminar key
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Configurá una API key de console.anthropic.com como respaldo
              automático si tu suscripción OAuth deja de funcionar.
            </p>
            <Link
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-violet-600 hover:underline dark:text-violet-400"
            >
              Obtener API key
              <ExternalLink className="h-3 w-3" />
            </Link>
            <div className="space-y-2">
              <FieldLabel htmlFor="claude-api-key">API key</FieldLabel>
              <div className="relative max-w-md">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="claude-api-key"
                  type="password"
                  placeholder="sk-ant-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pl-9"
                  disabled={connectingKey}
                />
              </div>
            </div>
            {error ? (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            ) : null}
            <Button
              type="button"
              className="bg-violet-600 hover:bg-violet-700"
              disabled={!apiKey.trim() || connectingKey}
              onClick={handleConnectKey}
            >
              {connectingKey ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validando…
                </>
              ) : (
                "Guardar API key"
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
