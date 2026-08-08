"use client";

import { Link2 } from "lucide-react";
import Link from "next/link";
import { Button, GlassPanel } from "@ai-coo/ui";
import { paths } from "@/routes";
import type { MarketingOverviewContext } from "@/app/marketing/actions";

interface UtmAttributionCardProps {
  summary: MarketingOverviewContext["utmSummary"];
  hasData: boolean;
}

/**
 * Card de atribución UTM para el sidebar del overview de marketing.
 * Muestra stats si hay datos, o un CTA de configuración si no.
 */
export function UtmAttributionCard({ summary, hasData }: UtmAttributionCardProps) {
  if (!hasData) {
    return (
      <GlassPanel className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15 text-violet-500">
            <Link2 size={13} />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Conexión ventas
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Aún no hay ventas atribuidas. Creá links UTM para trackear qué contenido genera leads.
        </p>
        <Button size="sm" variant="outline" asChild>
          <Link href={paths.platform.marketing.utms}>Generar UTMs</Link>
        </Button>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel className="space-y-3 p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15 text-violet-500">
          <Link2 size={13} />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Atribución UTM
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Clicks", value: summary.totalClicks.toLocaleString("es-AR") },
          { label: "Bookings", value: String(summary.totalBookings) },
          { label: "Ventas", value: String(summary.totalSales) },
          {
            label: "Revenue",
            value: `$${summary.totalRevenue.toLocaleString("es-AR")}`,
          },
        ].map((item) => (
          <div key={item.label} className="rounded-lg bg-muted/30 px-3 py-2">
            <p className="text-[10px] text-muted-foreground">{item.label}</p>
            <p className="text-base font-bold tabular-nums">{item.value}</p>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
