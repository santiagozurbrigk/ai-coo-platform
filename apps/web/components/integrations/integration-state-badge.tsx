import { cn } from "@ai-coo/ui";
import {
  AlertTriangle,
  Check,
  Circle,
  Loader2,
  TriangleAlert,
} from "lucide-react";
import type { IntegrationState } from "@/lib/integrations/health";

/**
 * Los cinco estados que una integración puede tener.
 *
 * El badge anterior declaraba `error` y nunca lo producía: la acción sólo
 * devolvía `connected` o `not_connected`. Ahora los cinco salen del contrato de
 * `health.ts` y todos son alcanzables.
 *
 * `attention` es el estado que faltaba y el que más importa: conectada, trayendo
 * datos, pero con algo que hace que una medida salga mal. Antes eso se veía
 * igual que "todo bien".
 */
const STATE_CONFIG: Record<
  IntegrationState,
  { label: string; icon: typeof Check; className: string; dot: string }
> = {
  connected: {
    label: "Conectada",
    icon: Check,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-500/10 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  attention: {
    label: "Requiere atención",
    icon: TriangleAlert,
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/25 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  error: {
    label: "Con error",
    icon: AlertTriangle,
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-400/25 dark:bg-red-500/10 dark:text-red-400",
    dot: "bg-red-500",
  },
  syncing: {
    label: "Sincronizando",
    icon: Loader2,
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/25 dark:bg-blue-500/10 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  not_connected: {
    label: "Sin conectar",
    icon: Circle,
    className: "border-border/60 bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/40",
  },
};

export function integrationStateLabel(state: IntegrationState): string {
  return STATE_CONFIG[state].label;
}

export function IntegrationStateDot({
  state,
  className,
}: {
  state: IntegrationState;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "h-1.5 w-1.5 shrink-0 rounded-full",
        STATE_CONFIG[state].dot,
        state === "syncing" && "animate-pulse",
        className,
      )}
    />
  );
}

export function IntegrationStateBadge({
  state,
  className,
}: {
  state: IntegrationState;
  className?: string;
}) {
  const config = STATE_CONFIG[state];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-[3px] text-[11px] font-medium",
        config.className,
        className,
      )}
    >
      <Icon
        className={cn("h-3 w-3", state === "syncing" && "animate-spin")}
        aria-hidden
      />
      {config.label}
    </span>
  );
}
