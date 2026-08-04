"use client";

import Link from "next/link";
import { Eye, Heart, MessageCircle, TrendingUp } from "lucide-react";
import { cn } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import { paths } from "@/routes";
import type { ZernioAnalyticsSummary } from "@/app/integrations/zernio/actions";

function EngagementBar({
  label,
  value,
  max,
  color,
  icon: Icon,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  icon: React.ElementType;
}) {
  const pct = max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 4;
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `${color}18`, color }}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="text-xs font-semibold tabular-nums">
            {value.toLocaleString("es")}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted/50">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
      </div>
    </div>
  );
}

export function ZernioAnalyticsSection({
  analytics,
}: {
  analytics: ZernioAnalyticsSummary;
}) {
  if (!analytics.hasData) {
    return (
      <Panel
        title="Rendimiento en Redes"
        subtitle="Métricas agregadas de tus publicaciones vía Zernio"
      >
        <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center">
          <p className="text-sm font-medium text-foreground">
            Conectá tus redes para ver analytics
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Vinculá cuentas en Zernio para ver impresiones, likes y comentarios
            de los últimos 30 días.
          </p>
          <Link
            href={paths.platform.integrations}
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            Ir a Integraciones
          </Link>
        </div>
      </Panel>
    );
  }

  const { totalImpressions, totalLikes, totalComments } = analytics;
  const engagements = totalLikes + totalComments;
  const engagementRate =
    totalImpressions > 0
      ? ((engagements / totalImpressions) * 100).toFixed(1)
      : "0.0";

  const max = Math.max(totalImpressions, totalLikes, totalComments, 1);

  return (
    <Panel
      title="Rendimiento en Redes"
      subtitle="Últimos 30 días vía Zernio"
    >
      <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
        {/* Engagement rate hero */}
        <div
          className={cn(
            "flex flex-col items-center justify-center rounded-xl border border-border/40 bg-muted/20 px-6 py-4 sm:min-w-[120px]",
            "dark:border-glass dark:bg-glass"
          )}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <TrendingUp className="h-4.5 w-4.5" />
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-primary">
            {engagementRate}%
          </p>
          <p className="mt-0.5 text-center text-[10px] text-muted-foreground">
            engagement rate
          </p>
        </div>

        {/* Bars */}
        <div className="space-y-3">
          <EngagementBar
            label="Impresiones"
            value={totalImpressions}
            max={max}
            color="#7C3AED"
            icon={Eye}
          />
          <EngagementBar
            label="Likes"
            value={totalLikes}
            max={max}
            color="#E11D48"
            icon={Heart}
          />
          <EngagementBar
            label="Comentarios"
            value={totalComments}
            max={max}
            color="#0F6E56"
            icon={MessageCircle}
          />
        </div>
      </div>
    </Panel>
  );
}
