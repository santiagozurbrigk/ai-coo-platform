"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bookmark,
  Eye,
  MessageCircle,
  Share2,
  ThumbsUp,
  TrendingUp,
  Users,
} from "lucide-react";
import type { ContentAssetView } from "@/app/marketing/actions";
import { formatDuration } from "@/lib/youtube/parse-duration";
import { estimateRetentionAtCTA } from "@/lib/youtube/retention";
import { CTAMinuteInput } from "@/components/marketing/cta-minute-input";

function PlatformMetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 dark:border-white/[0.08]">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[10px] uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-1 text-base font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}

function resolveDurationSeconds(asset: ContentAssetView): number {
  return (
    asset.durationSeconds ??
    asset.platformMetadata?.youtube?.duration_seconds ??
    0
  );
}

function resolveRetentionPct(asset: ContentAssetView): number {
  if (asset.retentionAtCtaPct != null) return asset.retentionAtCtaPct;
  const duration = resolveDurationSeconds(asset);
  if (!asset.ctaMinute || !duration) return 0;
  return estimateRetentionAtCTA(asset.ctaMinute, duration);
}

export function ContentPlatformMetrics({
  asset,
}: {
  asset: ContentAssetView;
}) {
  const [ctaMinute, setCtaMinute] = useState(asset.ctaMinute);
  const [retentionPct, setRetentionPct] = useState(asset.retentionAtCtaPct);

  if (asset.platform === "youtube") {
    const duration = resolveDurationSeconds(asset);
    const displayRetention =
      retentionPct ??
      (ctaMinute && duration
        ? estimateRetentionAtCTA(ctaMinute, duration)
        : null);

    return (
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-2">
          <PlatformMetricCard
            label="Vistas"
            value={asset.views.toLocaleString("es-ES")}
            icon={Eye}
          />
          <PlatformMetricCard
            label="Likes"
            value={asset.likes.toLocaleString("es-ES")}
            icon={ThumbsUp}
          />
          <PlatformMetricCard
            label="Comentarios"
            value={asset.comments.toLocaleString("es-ES")}
            icon={MessageCircle}
          />
        </div>

        {duration > 0 ? (
          <p className="text-[11px] text-muted-foreground">
            Duración: {formatDuration(duration)}
          </p>
        ) : null}

        {ctaMinute ? (
          <div className="flex flex-col gap-1.5 rounded-lg border border-border/40 bg-muted/30 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Retención hasta el CTA
              </span>
              <span className="text-[11px] text-muted-foreground">
                CTA en {formatDuration(ctaMinute)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-brand-500"
                  style={{ width: `${displayRetention ?? 0}%` }}
                />
              </div>
              <span className="text-[13px] font-semibold tabular-nums text-foreground">
                {displayRetention ?? 0}%
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Estimación basada en curva típica de retención de YouTube
            </p>
          </div>
        ) : (
          <CTAMinuteInput
            assetId={asset.id}
            onSaved={(second, pct) => {
              setCtaMinute(second);
              setRetentionPct(pct);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <PlatformMetricCard
        label="Alcance"
        value={asset.reach.toLocaleString("es-ES")}
        icon={Users}
      />
      <PlatformMetricCard
        label="Engagement"
        value={
          asset.engagementRate != null
            ? `${asset.engagementRate.toFixed(1)}%`
            : "—"
        }
        icon={TrendingUp}
      />
      <PlatformMetricCard
        label="Saves"
        value={asset.saves.toLocaleString("es-ES")}
        icon={Bookmark}
      />
      <PlatformMetricCard
        label="Shares"
        value={asset.shares.toLocaleString("es-ES")}
        icon={Share2}
      />
    </div>
  );
}
