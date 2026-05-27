"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import { getCalendlyIntegrationStatusAction } from "@/app/calendly/actions";
import { paths } from "@/routes";
import { cn } from "@ai-coo/ui";

type CalendlyManualSyncNoticeProps = {
  /** Si true, muestra enlace a Integraciones (útil en Closing). */
  showIntegrationsLink?: boolean;
  className?: string;
};

/**
 * Aviso cuando Calendly está conectado pero sin webhooks (plan distinto de Standard).
 */
export function CalendlyManualSyncNotice({
  showIntegrationsLink = false,
  className,
}: CalendlyManualSyncNoticeProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    getCalendlyIntegrationStatusAction().then((s) => {
      setVisible(s.connected && !s.webhookEnabled);
    });
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      className={cn(
        "flex gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/95",
        className
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden />
      <div className="space-y-1">
        <p className="font-medium text-amber-50">
          Sincronización manual de Calendly
        </p>
        <p className="text-xs leading-relaxed text-amber-100/90">
          Sin el plan <strong className="font-semibold">Standard</strong> de Calendly
          no hay actualización automática de llamadas.{" "}
          {showIntegrationsLink ? (
            <>
              Ve a{" "}
              <Link
                href={paths.platform.integrations}
                className="font-medium text-amber-200 underline underline-offset-2 hover:text-amber-50"
              >
                Integraciones
              </Link>{" "}
              y pulsa <strong className="font-semibold">Sincronizar ahora</strong> en
              la tarjeta de Calendly para traer tus citas a Closing.
            </>
          ) : (
            <>
              Pulsa <strong className="font-semibold">Sincronizar ahora</strong> en esta
              tarjeta cada vez que quieras importar citas nuevas o actualizadas a
              Closing.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
