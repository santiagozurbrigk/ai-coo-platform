"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import type { Integration } from "@/types/integrations";
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

export function IntegrationGrid({ integrations }: { integrations: Integration[] }) {
  const searchParams = useSearchParams();
  const { push } = useToast();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    const connected = searchParams.get("calendly");
    if (connected !== "connected") return;

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
  }, [searchParams, push]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {integrations.map((int) => (
        <IntegrationCard key={int.id} integration={int} />
      ))}
    </div>
  );
}
