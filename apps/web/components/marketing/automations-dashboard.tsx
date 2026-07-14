"use client";

import Link from "next/link";
import { Zap, CheckCircle2, PauseCircle, FileEdit, ExternalLink } from "lucide-react";
import { Button } from "@ai-coo/ui";
import type { AutomationFlow } from "@/app/marketing/automations-actions";

const STATUS_CONFIG = {
  active: {
    label: "Activo",
    icon: CheckCircle2,
    className: "text-emerald-500",
    dot: "bg-emerald-500",
  },
  paused: {
    label: "Pausado",
    icon: PauseCircle,
    className: "text-yellow-500",
    dot: "bg-yellow-500",
  },
  draft: {
    label: "Borrador",
    icon: FileEdit,
    className: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
} satisfies Record<AutomationFlow["status"], { label: string; icon: React.ElementType; className: string; dot: string }>;

const SOURCE_LABEL: Record<AutomationFlow["source"], string> = {
  manychat: "ManyChat",
};

function FlowRow({ flow }: { flow: AutomationFlow }) {
  const cfg = STATUS_CONFIG[flow.status];
  const StatusIcon = cfg.icon;

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/40 bg-muted/20 px-4 py-3 transition-colors hover:bg-muted/40">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`h-2 w-2 shrink-0 rounded-full ${cfg.dot}`} />
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-foreground">{flow.name}</p>
          <p className="text-[11px] text-muted-foreground">{SOURCE_LABEL[flow.source]}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <StatusIcon className={`h-3.5 w-3.5 ${cfg.className}`} />
        <span className={`text-[11px] font-medium ${cfg.className}`}>{cfg.label}</span>
      </div>
    </div>
  );
}

function EmptyState({ manychatConnected, integrationsPath }: { manychatConnected: boolean; integrationsPath: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/50 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
        <Zap className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">
          {manychatConnected
            ? "No hay flujos configurados en ManyChat"
            : "ManyChat no está conectado"}
        </p>
        <p className="max-w-xs text-xs text-muted-foreground">
          {manychatConnected
            ? "Creá flujos en ManyChat y aparecerán acá automáticamente."
            : "Conectá ManyChat para ver tus flujos de automatización."}
        </p>
      </div>
      {!manychatConnected && (
        <Button size="sm" asChild>
          <Link href={integrationsPath}>Ir a Integraciones</Link>
        </Button>
      )}
      {manychatConnected && (
        <Button size="sm" variant="outline" asChild>
          <a href="https://app.manychat.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
            Abrir ManyChat <ExternalLink className="h-3 w-3" />
          </a>
        </Button>
      )}
    </div>
  );
}

export function AutomationsDashboard({
  flows,
  manychatConnected,
  integrationsPath,
}: {
  flows: AutomationFlow[];
  manychatConnected: boolean;
  integrationsPath: string;
}) {
  const active = flows.filter((f) => f.status === "active");
  const paused = flows.filter((f) => f.status === "paused");
  const draft = flows.filter((f) => f.status === "draft");

  if (flows.length === 0) {
    return <EmptyState manychatConnected={manychatConnected} integrationsPath={integrationsPath} />;
  }

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Activos", count: active.length, color: "text-emerald-500" },
          { label: "Pausados", count: paused.length, color: "text-yellow-500" },
          { label: "Borradores", count: draft.length, color: "text-muted-foreground" },
        ].map(({ label, count, color }) => (
          <div key={label} className="rounded-xl border border-border/40 bg-muted/20 p-4 text-center">
            <p className={`text-2xl font-semibold tracking-tight ${color}`}>{count}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Listado */}
      <div className="space-y-2">
        {flows.map((flow) => (
          <FlowRow key={flow.id} flow={flow} />
        ))}
      </div>

      <div className="flex justify-end">
        <Button size="sm" variant="outline" asChild>
          <a href="https://app.manychat.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
            Gestionar en ManyChat <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
      </div>
    </div>
  );
}
