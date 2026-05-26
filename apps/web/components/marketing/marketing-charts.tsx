"use client";

import { useMemo, useState, type ReactNode } from "react";
import { GlassPanel, cn } from "@ai-coo/ui";
import { motion } from "framer-motion";
import { getContentById } from "@/mocks/marketing-insights";
import type {
  ContentFunnelStage,
  ContentTypePerformance,
  FollowerGrowthPoint,
  HeatmapCell,
  MarketingTimePoint,
} from "@/types/marketing-insights";
import { CONTENT_TYPE_LABEL } from "@/components/marketing-insights/content-labels";
import { ContentThumbnail } from "@/components/marketing-insights/content-thumbnail";
import { chartColors } from "@/lib/chart/colors";
import { paths } from "@/routes";
import Link from "next/link";

function ChartShell({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <GlassPanel className={cn("p-4 space-y-3", className)}>
      <div>
        <h4 className="text-sm font-medium">{title}</h4>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.div>
    </GlassPanel>
  );
}

export function ReachInteractionsChart({ data }: { data: MarketingTimePoint[] }) {
  const W = 520;
  const H = 200;
  const pad = { l: 36, r: 8, t: 12, b: 24 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const yR = (v: number) => {
    const max = Math.max(...data.map((d) => d.reach));
    return pad.t + innerH - (v / max) * innerH;
  };
  const yI = (v: number) => {
    const max = Math.max(...data.map((d) => d.interactions));
    return pad.t + innerH - (v / max) * innerH;
  };
  const x = (i: number) => pad.l + (i / (data.length - 1)) * innerW;

  const area = (key: "reach" | "interactions") => {
    const pts = data.map((d, i) =>
      `${x(i)},${key === "reach" ? yR(d.reach) : yI(d.interactions)}`
    );
    const base = pad.t + innerH;
    return `${pts.join(" ")} ${x(data.length - 1)},${base} ${x(0)},${base}`;
  };

  return (
    <ChartShell
      title="Alcance e interacciones"
      subtitle="Últimos 30 días"
      className="lg:col-span-2"
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <defs>
          <linearGradient id="reachG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="intG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColors.info} stopOpacity="0.35" />
            <stop offset="100%" stopColor={chartColors.info} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area("reach")} fill="url(#reachG)" />
        <polygon points={area("interactions")} fill="url(#intG)" />
        <polyline
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          points={data.map((d, i) => `${x(i)},${yR(d.reach)}`).join(" ")}
        />
        <polyline
          fill="none"
          stroke={chartColors.info}
          strokeWidth="2"
          points={data.map((d, i) => `${x(i)},${yI(d.interactions)}`).join(" ")}
        />
      </svg>
      <div className="flex gap-4 text-xs justify-center">
        <span className="flex items-center gap-1">
          <span className="h-2 w-3 rounded bg-primary/60" /> Alcance
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-3 rounded bg-[hsl(var(--info)/0.6)]" /> Interacciones
        </span>
      </div>
    </ChartShell>
  );
}

export function TopConvertingContentList({
  ranked,
}: {
  ranked: { contentId: string; conversations: number; bookings: number }[];
}) {
  const max = Math.max(...ranked.map((r) => r.conversations), 1);
  return (
    <ChartShell title="Contenido que más convierte" subtitle="Por conversaciones generadas">
      <div className="space-y-3">
        {ranked.map((item, i) => {
          const content = getContentById(item.contentId);
          if (!content) return null;
          const borderColors = [
            "border-l-primary shadow-[0_0_20px_hsl(var(--primary)/0.25)]",
            "border-l-[hsl(var(--chart-secondary))]",
            "border-l-[hsl(var(--info)/0.7)]",
            "border-l-muted",
          ];
          return (
            <Link
              key={content.id}
              href={paths.platform.marketing.contentDetail(content.id)}
              className={cn(
                "flex gap-3 rounded-lg border border-border border-l-4 p-3 transition-all hover:scale-[1.01] hover:border-primary/40",
                borderColors[i] ?? "border-l-muted"
              )}
            >
              <span className="text-lg font-bold text-muted-foreground w-6">
                {i + 1}
              </span>
              <ContentThumbnail content={content} size="sm" className="h-14 w-14 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{content.title}</p>
                <p className="text-xs text-muted-foreground">
                  {CONTENT_TYPE_LABEL[content.type]} · {item.conversations} convs ·{" "}
                  {item.bookings} bookings
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </ChartShell>
  );
}

export function ContentFunnelChart({ stages }: { stages: ContentFunnelStage[] }) {
  const max = stages[0]?.value ?? 1;
  return (
    <ChartShell title="Funnel de contenido a venta" subtitle="Conversión entre etapas">
      <div className="space-y-2">
        {stages.map((s, i) => {
          const widthPct = 40 + (s.value / max) * 60;
          return (
            <div key={s.stage} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{s.stage}</span>
                <span className="tabular-nums text-muted-foreground">
                  {s.value.toLocaleString("es-ES")}
                  {s.conversionToNextPct != null && i < stages.length - 1 && (
                    <> → {s.conversionToNextPct}%</>
                  )}
                </span>
              </div>
              <div
                className="h-9 rounded-md bg-gradient-to-r from-primary/80 to-[hsl(var(--chart-tertiary)/0.45)] mx-auto transition-all"
                style={{ width: `${widthPct}%` }}
              />
            </div>
          );
        })}
      </div>
    </ChartShell>
  );
}

export function TypeRadarChart({ types }: { types: ContentTypePerformance[] }) {
  const cx = 100;
  const cy = 100;
  const maxR = 70;
  const angles = types.map((_, i) => (i / types.length) * 2 * Math.PI - Math.PI / 2);
  const reachMax = Math.max(...types.map((t) => t.reach));
  const convMax = Math.max(...types.map((t) => t.conversions));

  const poly = (key: "reach" | "conversions", fill: string) => {
    const pts = types
      .map((t, i) => {
        const r =
          (key === "reach" ? t.reach / reachMax : t.conversions / convMax) * maxR;
        return `${cx + r * Math.cos(angles[i])},${cy + r * Math.sin(angles[i])}`;
      })
      .join(" ");
    return (
      <polygon
        points={pts}
        fill={fill}
        stroke={key === "reach" ? chartColors.primary : chartColors.tertiary}
        strokeWidth="1.5"
        opacity={0.55}
      />
    );
  };

  return (
    <ChartShell title="Performance por tipo" subtitle="Alcance vs conversiones">
      <svg viewBox="0 0 200 200" className="w-full max-w-[240px] mx-auto">
        {[0.25, 0.5, 0.75, 1].map((s) => (
          <circle
            key={s}
            cx={cx}
            cy={cy}
            r={maxR * s}
            fill="none"
            stroke="currentColor"
            className="text-border"
            opacity={0.3}
          />
        ))}
        {poly("reach", "hsl(var(--primary) / 0.2)")}
        {poly("conversions", "hsl(var(--chart-tertiary) / 0.25)")}
        {types.map((t, i) => (
          <text
            key={t.type}
            x={cx + (maxR + 14) * Math.cos(angles[i])}
            y={cy + (maxR + 14) * Math.sin(angles[i])}
            textAnchor="middle"
            fontSize="8"
            className="fill-muted-foreground"
          >
            {CONTENT_TYPE_LABEL[t.type]}
          </text>
        ))}
      </svg>
    </ChartShell>
  );
}

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function PublishHeatmap({ cells }: { cells: HeatmapCell[] }) {
  const [tip, setTip] = useState<HeatmapCell | null>(null);
  return (
    <ChartShell title="Mejores días y horarios" subtitle="Intensidad = engagement">
      <div className="overflow-x-auto">
        <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `repeat(7, 1fr)` }}>
          {DAY_LABELS.map((d) => (
            <div key={d} className="text-[9px] text-center text-muted-foreground pb-1">
              {d}
            </div>
          ))}
          {cells.map((cell) => (
            <button
              key={`${cell.day}-${cell.hour}`}
              type="button"
              className="h-3 w-6 rounded-sm transition-transform hover:scale-110"
              style={{
                background: `hsl(var(--primary) / ${0.08 + cell.engagement * 0.92})`,
              }}
              onMouseEnter={() => setTip(cell)}
              onMouseLeave={() => setTip(null)}
            />
          ))}
        </div>
      </div>
      {tip && (
        <p className="text-xs text-muted-foreground text-center">
          {DAY_LABELS[tip.day]} {tip.hour}:00 — engagement{" "}
          {(tip.engagement * 100).toFixed(0)}%
        </p>
      )}
    </ChartShell>
  );
}

export function FollowerGrowthChart({ data }: { data: FollowerGrowthPoint[] }) {
  const W = 400;
  const H = 160;
  const pad = { l: 40, r: 8, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const min = Math.min(...data.map((d) => d.followers));
  const max = Math.max(...data.map((d) => d.followers));
  const y = (v: number) => pad.t + innerH - ((v - min) / (max - min || 1)) * innerH;
  const x = (i: number) => pad.l + (i / (data.length - 1)) * innerW;

  return (
    <ChartShell title="Crecimiento de seguidores" subtitle="Últimas 8 semanas">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <defs>
          <linearGradient id="folG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points={`${data.map((d, i) => `${x(i)},${y(d.followers)}`).join(" ")} ${x(data.length - 1)},${pad.t + innerH} ${x(0)},${pad.t + innerH}`}
          fill="url(#folG)"
        />
        <polyline
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          points={data.map((d, i) => `${x(i)},${y(d.followers)}`).join(" ")}
        />
        {data.map((d, i) => (
          <circle key={d.week} cx={x(i)} cy={y(d.followers)} r="3" fill="hsl(var(--primary))" />
        ))}
      </svg>
      {data
        .filter((d) => d.spikeLabel)
        .map((d) => (
          <p key={d.week} className="text-xs text-muted-foreground border-l-2 border-primary pl-2">
            {d.spikeLabel}
          </p>
        ))}
    </ChartShell>
  );
}
