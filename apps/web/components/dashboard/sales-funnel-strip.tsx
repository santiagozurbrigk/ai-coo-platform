"use client";

import { cn } from "@ai-coo/ui";
import { usePlatformData } from "@/providers/platform-data-provider";
import { FunnelChartPanel } from "@/components/charts/platform/funnel-chart-panel";

function conversionRate(from: number, to: number): string {
  if (from === 0) return "—";
  return `${Math.round((to / from) * 100)}%`;
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

  // Skip if no data at all
  if (totalLeads === 0 && activeClients === 0) return null;

  const stages = [
    { label: "Leads DMs", value: totalLeads },
    { label: "Respondidos", value: responded },
    { label: "Agendados", value: booked },
    { label: "Cierres", value: closed },
    { label: "Clientes activos", value: activeClients },
  ].filter((s) => s.value >= 0);

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

      <FunnelChartPanel
        stages={stages}
        orientation="horizontal"
        color="hsl(var(--primary))"
        style={{ minHeight: 180, aspectRatio: "3.2 / 1" }}
        className="min-h-[180px]"
      />
    </div>
  );
}
