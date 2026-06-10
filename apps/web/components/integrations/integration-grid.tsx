"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import type { Integration } from "@/types/integrations";
import { groupIntegrationsByCategory } from "@/lib/integrations/integration-groups";
import { GOOGLE_PERMISSION_RECONNECT_MESSAGE } from "@/lib/google/errors";
import { useMarketingData } from "@/providers";
import { useToast } from "@/providers/toast-provider";
import { IntegrationCard } from "./integration-card";
import { IntegrationSectionHeader } from "./integration-section-header";

const WEBHOOK_TOAST: Record<string, { title: string; description: string }> = {
  standard_required: {
    title: "Calendly conectado",
    description:
      "Sin plan Standard no hay sync automática. En Integraciones, pulsa «Sincronizar ahora» en Calendly para traer tus citas a Closing.",
  },
  localhost: {
    title: "Calendly conectado",
    description:
      "Webhooks no configurados en local. Sincroniza manualmente desde Integraciones.",
  },
  https_required: {
    title: "Calendly conectado",
    description:
      "La URL del webhook debe ser HTTPS. La sincronización manual sigue disponible.",
  },
  create_failed: {
    title: "Calendly conectado",
    description:
      "No se pudo registrar el webhook. Puedes sincronizar manualmente desde Integraciones.",
  },
  invalid_url: {
    title: "Calendly conectado",
    description: "URL de webhook inválida. Usa sincronización manual.",
  },
};

const OAUTH_TOAST: Record<
  string,
  Record<string, { title: string; description: string; variant?: "success" | "default" }>
> = {
  google_forms: {
    connected: {
      title: "Google conectado",
      description:
        "Forms, Drive y YouTube quedaron vinculados con los permisos actualizados.",
      variant: "success",
    },
    permissions: {
      title: "Permisos de Google incompletos",
      description: GOOGLE_PERMISSION_RECONNECT_MESSAGE,
    },
    error: {
      title: "Error al conectar Google Forms",
      description: "Revisá las variables de entorno y volvé a intentar.",
    },
  },
  youtube: {
    connected: {
      title: "YouTube conectado",
      description: "Canal vinculado. Los videos se sincronizan en Content Library.",
      variant: "success",
    },
    error: {
      title: "Error al conectar YouTube",
      description: "Revisá la configuración OAuth en Google Cloud.",
    },
  },
  typeform: {
    connected: {
      title: "Typeform conectado",
      description: "Formularios y respuestas se sincronizarán automáticamente.",
      variant: "success",
    },
    error: {
      title: "Error al conectar Typeform",
      description: "Verificá el redirect URI en Typeform Developer.",
    },
  },
  discord: {
    connected: {
      title: "Discord conectado",
      description:
        "El bot está en tu servidor. Configurá canales y vinculaciones en Gestionar.",
      variant: "success",
    },
    error: {
      title: "Error al conectar Discord",
      description: "Revisá las credenciales y el redirect URI en Discord Developers.",
    },
  },
};

export function IntegrationGrid({ integrations }: { integrations: Integration[] }) {
  const searchParams = useSearchParams();
  const { push } = useToast();
  const { setInstagramConnected } = useMarketingData();
  const handled = useRef(false);
  const sections = groupIntegrationsByCategory(integrations);

  useEffect(() => {
    if (handled.current) return;

    const instagramSuccess = searchParams.get("success");
    if (instagramSuccess === "instagram") {
      handled.current = true;
      setInstagramConnected(true);
      push({
        title: "Instagram conectado",
        description: "Tu cuenta quedó vinculada. El contenido se sincronizará automáticamente.",
        variant: "success",
      });
      return;
    }

    const oauthError = searchParams.get("error");
    if (oauthError === "instagram_denied") {
      handled.current = true;
      push({
        title: "Conexión cancelada",
        description: "No se autorizó el acceso a Instagram.",
      });
      return;
    }
    if (oauthError === "instagram_failed") {
      handled.current = true;
      push({
        title: "Error al conectar Instagram",
        description:
          "Revisá que la cuenta sea Instagram Business y esté vinculada a una página de Facebook.",
      });
      return;
    }

    if (instagramSuccess === "stripe" && !handled.current) {
      handled.current = true;
      push({
        title: "Stripe conectado",
        description: "Tu cuenta quedó vinculada. Revisá balance y transacciones en Finanzas.",
        variant: "success",
      });
      return;
    }
    if (oauthError === "stripe_denied") {
      handled.current = true;
      push({
        title: "Conexión cancelada",
        description: "No se autorizó el acceso a Stripe.",
      });
      return;
    }
    if (oauthError === "stripe_failed") {
      handled.current = true;
      push({
        title: "Error al conectar Stripe",
        description: "Revisá las credenciales en Stripe Connect y las variables de entorno.",
      });
      return;
    }

    const calendlyStatus = searchParams.get("calendly");
    if (calendlyStatus === "connected") {
      handled.current = true;
      const webhook = searchParams.get("calendly_webhook");
      const custom = webhook ? WEBHOOK_TOAST[webhook] : null;
      push({
        title: custom?.title ?? "Calendly conectado",
        description:
          custom?.description ??
          "Los eventos nuevos se sincronizarán automáticamente vía webhook.",
        variant: "success",
      });
      return;
    }

    for (const provider of Object.keys(OAUTH_TOAST)) {
      const status = searchParams.get(provider);
      if (!status) continue;

      handled.current = true;
      const toast = OAUTH_TOAST[provider]?.[status];
      if (toast) {
        push({
          title: toast.title,
          description: toast.description,
          variant: toast.variant ?? "default",
        });
      }
      return;
    }
  }, [searchParams, push, setInstagramConnected]);

  return (
    <div className="flex flex-col gap-6">
      {sections.map((section) => (
        <section key={section.label}>
          <IntegrationSectionHeader label={section.label} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {section.items.map((integration) => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
