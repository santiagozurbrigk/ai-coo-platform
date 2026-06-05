"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import type { Integration } from "@/types/integrations";
import { GOOGLE_PERMISSION_RECONNECT_MESSAGE } from "@/lib/google/errors";
import { useToast } from "@/providers/toast-provider";
import { IntegrationCard } from "./integration-card";

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
  fathom: {
    connected: {
      title: "Fathom conectado",
      description: "Las llamadas se procesarán con IA automáticamente.",
      variant: "success",
    },
    error: {
      title: "Error al conectar Fathom",
      description: "Revisá credenciales y redirect URI.",
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
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;

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
  }, [searchParams, push]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {integrations.map((int) => (
        <IntegrationCard key={int.id} integration={int} />
      ))}
    </div>
  );
}
