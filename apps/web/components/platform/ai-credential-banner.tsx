"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { SteppedAlert } from "@ai-coo/ui";
import type { AiCredentialBannerState } from "@/lib/ai/credential-types";

const DISMISS_KEY = "otc_ai_credential_banner_dismissed";

type AiCredentialBannerProps = {
  state: AiCredentialBannerState | null;
};

export function AiCredentialBanner({ state }: AiCredentialBannerProps) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (!state) return;

    const stored = sessionStorage.getItem(DISMISS_KEY);
    const fingerprint = `${state.mode}:${state.hasApiKey}:${state.hasOAuth}`;
    if (stored === fingerprint) {
      setDismissed(true);
      return;
    }
    setDismissed(false);
  }, [state]);

  if (!state || dismissed) return null;

  const dismiss = () => {
    const fingerprint = `${state.mode}:${state.hasApiKey}:${state.hasOAuth}`;
    sessionStorage.setItem(DISMISS_KEY, fingerprint);
    setDismissed(true);
  };

  if (state.mode === "oauth_active" && state.hasOAuth && !state.hasApiKey) {
    return (
      <div className="relative border-b border-amber-500/25 bg-amber-500/10 px-4 py-3">
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          aria-label="Cerrar aviso"
        >
          <X className="h-4 w-4" />
        </button>
        <SteppedAlert
          variant="warning"
          title="Conectá una API key de respaldo"
          icon={<AlertTriangle className="h-4 w-4" />}
          action={
            <Link
              href="/settings?tab=ia"
              className="text-sm font-medium text-foreground underline underline-offset-2 hover:text-primary"
            >
              Ir a Configuración → IA
            </Link>
          }
        >
          Estás usando tu suscripción de Claude para las funciones de IA. Te
          recomendamos conectar una API key como respaldo — si Claude restringe
          este acceso, las funciones de IA de OTC dejarán de funcionar
          automáticamente.
        </SteppedAlert>
      </div>
    );
  }

  if (state.mode === "oauth_degraded") {
    return (
      <div className="relative border-b border-blue-500/25 bg-blue-500/10 px-4 py-3">
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          aria-label="Cerrar aviso"
        >
          <X className="h-4 w-4" />
        </button>
        <SteppedAlert
          variant="info"
          title="Usando API key de respaldo"
          icon={<RefreshCw className="h-4 w-4" />}
        >
          Las funciones de IA cambiaron a tu API key de respaldo porque tu
          suscripción de Claude no está disponible temporalmente. Estamos
          verificando cada 24hs para volver automáticamente.
          {state.oauthFailedAt ? (
            <span className="mt-1 block text-xs text-muted-foreground">
              Último fallo:{" "}
              {new Date(state.oauthFailedAt).toLocaleString("es", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          ) : null}
        </SteppedAlert>
      </div>
    );
  }

  return null;
}
