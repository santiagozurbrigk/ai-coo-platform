import { cn } from "@ai-coo/ui";

export type IntegrationCardStatus =
  | "connected"
  | "not_connected"
  | "error"
  | "syncing";

const STATUS_CONFIG: Record<
  IntegrationCardStatus,
  { label: string; className: string }
> = {
  connected: {
    label: "Conectado",
    className: "bg-emerald-900/30 text-emerald-400",
  },
  not_connected: {
    label: "No conectado",
    className: "bg-muted text-muted-foreground border border-border/40",
  },
  error: {
    label: "Error",
    className: "bg-red-900/20 text-red-400",
  },
  syncing: {
    label: "Sincronizando",
    className: "bg-blue-900/20 text-blue-400",
  },
};

export function IntegrationStatusBadge({
  status,
}: {
  status: IntegrationCardStatus;
}) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.not_connected;

  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
