"use client";

import { cn } from "@ai-coo/ui";
import { usePlatformData } from "@/providers/platform-data-provider";

type FunnelStage = {
  label: string;
  count: number;
  color: string;
  glow: string;
};

function conversionRate(from: number, to: number): string {
  if (from === 0) return "—";
  return `${Math.round((to / from) * 100)}%`;
}

function StageBlock({
  stage,
  total,
  isLast,
  convRate,
}: {
  stage: FunnelStage;
  total: number;
  isLast: boolean;
  convRate: string | null;
}) {
  const pct = total > 0 ? Math.max(8, Math.round((stage.count / total) * 100)) : 0;

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      {/* Bar */}
      <div className="relative flex items-end" style={{ height: 56 }}>
        <div
          className="w-full rounded-t-lg transition-all duration-700"
          style={{
            height: `${pct}%`,
            background: stage.color,
            boxShadow: `0 0 16px ${stage.glow}`,
          }}
        />
        {/* Connector arrow */}
        {!isLast && (
          <div className="absolute -right-3 top-1/2 z-10 -translate-y-1/2">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 6h9M7 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/40" />
            </svg>
          </div>
        )}
      </div>

      {/* Labels */}
      <div className="space-y-0.5">
        <p
          className="text-xl font-semibold tabular-nums leading-none tracking-tight"
          style={{ color: stage.color }}
        >
          {stage.count.toLocaleString("es")}
        </p>
        <p className="text-xs text-muted-foreground">{stage.label}</p>
        {convRate !== null && (
          <p className="text-[10px] text-muted-foreground/60">
            conv. {convRate}
          </p>
        )}
      </div>
    </div>
  );
}

export function SalesFunnelStrip() {
  const { conversations, closingCalls, clients } = usePlatformData();

  const totalLeads = conversations.length;
  const responded = conversations.filter(
    (c) => c.status === "active" || c.status === "booked" || c.status === "closed"
  ).length;
  const booked = conversations.filter(
    (c) =>
      c.status === "booked" || c.tag === "agendado" || c.tag === "closeado"
  ).length;
  const closed = closingCalls.filter((c) => c.status === "closed").length;
  const activeClients = clients.filter((c) => c.status === "active").length;

  const stages: FunnelStage[] = [
    {
      label: "Leads DMs",
      count: totalLeads,
      color: "hsl(var(--primary))",
      glow: "hsl(var(--primary) / 0.3)",
    },
    {
      label: "Respondidos",
      count: responded,
      color: "#7C3AED",
      glow: "rgba(124,58,237,0.3)",
    },
    {
      label: "Agendados",
      count: booked,
      color: "#0F6E56",
      glow: "rgba(15,110,86,0.3)",
    },
    {
      label: "Cierres",
      count: closed,
      color: "#185FA5",
      glow: "rgba(24,95,165,0.3)",
    },
    {
      label: "Clientes activos",
      count: activeClients,
      color: "#D97706",
      glow: "rgba(217,119,6,0.3)",
    },
  ];

  // Skip if no data at all
  if (totalLeads === 0 && activeClients === 0) return null;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card px-5 pb-5 pt-4",
        "dark:border-glass dark:bg-glass dark:backdrop-blur-md"
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Embudo de conversión</p>
          <p className="text-xs text-muted-foreground">DMs a clientes activos</p>
        </div>
        {totalLeads > 0 && activeClients > 0 && (
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            {conversionRate(totalLeads, activeClients)} total
          </span>
        )}
      </div>

      <div className="flex items-stretch gap-6 sm:gap-8">
        {stages.map((stage, i) => (
          <StageBlock
            key={stage.label}
            stage={stage}
            total={totalLeads}
            isLast={i === stages.length - 1}
            convRate={
              i === 0
                ? null
                : conversionRate(stages[i - 1].count, stage.count)
            }
          />
        ))}
      </div>
    </div>
  );
}
