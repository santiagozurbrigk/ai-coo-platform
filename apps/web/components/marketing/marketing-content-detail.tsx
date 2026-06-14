"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge, Button, GlassPanel } from "@ai-coo/ui";
import type { ContentAssetView } from "@/app/marketing/actions";
import { paths } from "@/routes";
import type { ContentAsset } from "@/types/marketing-insights";
import { CONTENT_TYPE_LABEL } from "@/components/marketing-insights/content-labels";
import { ContentThumbnail } from "@/components/marketing-insights/content-thumbnail";

export function MarketingContentDetail({
  asset,
  mockContent,
  hasRealData,
}: {
  asset?: ContentAssetView;
  mockContent?: ContentAsset;
  hasRealData: boolean;
}) {
  if (asset) {
    const type = asset.contentType ?? "post";
    return (
      <div className="space-y-8">
        <Button variant="ghost" size="sm" className="gap-2 -ml-2" asChild>
          <Link href={paths.platform.marketing.content}>
            <ArrowLeft className="h-4 w-4" />
            Contenido
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
          <div className="relative aspect-[9/16] max-h-72 overflow-hidden rounded-xl bg-muted/40 lg:max-w-sm">
            {asset.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={asset.thumbnailUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-4xl">
                📄
              </div>
            )}
          </div>
          <div className="space-y-3">
            <Badge variant="secondary">{type}</Badge>
            <h2 className="text-2xl font-semibold">{asset.title}</h2>
            <p className="text-sm text-muted-foreground">
              {asset.platform} ·{" "}
              {asset.publishedAt
                ? new Date(asset.publishedAt).toLocaleDateString("es")
                : "Sin fecha"}
            </p>
            {asset.caption ? (
              <p className="text-sm text-muted-foreground line-clamp-4">
                {asset.caption}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Alcance", value: asset.reach },
            { label: "Views", value: asset.views },
            { label: "Likes", value: asset.likes },
            { label: "Comentarios", value: asset.comments },
            { label: "Saves", value: asset.saves },
            { label: "Shares", value: asset.shares },
          ].map((m) => (
            <GlassPanel key={m.label} className="p-3 text-center">
              <p className="text-2xs text-muted-foreground">{m.label}</p>
              <p className="mt-1 text-lg font-semibold tabular-nums">
                {m.value.toLocaleString("es-ES")}
              </p>
            </GlassPanel>
          ))}
        </div>
      </div>
    );
  }

  if (!mockContent) return null;

  const content = mockContent;
  const touch = content.journeyTouch ?? {
    firstTouchPct: 34,
    middleTouchPct: 48,
    lastBeforeDmPct: 18,
  };

  return (
    <div className="space-y-8">
      {!hasRealData ? (
        <span className="inline-flex rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
          Sin datos reales aún — datos de demostración
        </span>
      ) : null}

      <Button variant="ghost" size="sm" className="gap-2 -ml-2" asChild>
        <Link href={paths.platform.marketing.content}>
          <ArrowLeft className="h-4 w-4" />
          Contenido
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <ContentThumbnail content={content} size="lg" className="h-56 lg:h-72 aspect-video" />
        <div className="space-y-3">
          <Badge variant="secondary">{CONTENT_TYPE_LABEL[content.type]}</Badge>
          <h2 className="text-2xl font-semibold">{content.title}</h2>
          <p className="text-sm text-muted-foreground">Publicado {content.publishDate}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Alcance", value: content.reach.toLocaleString("es-ES") },
          { label: "Impresiones", value: content.impressions.toLocaleString("es-ES") },
          { label: "Likes", value: content.likes.toLocaleString("es-ES") },
          { label: "Comentarios", value: String(content.comments) },
          { label: "Saves", value: String(content.saves) },
          { label: "Shares", value: String(content.shares) },
        ].map((m) => (
          <GlassPanel key={m.label} className="p-3 text-center">
            <p className="text-2xs text-muted-foreground">{m.label}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{m.value}</p>
          </GlassPanel>
        ))}
      </div>

      <GlassPanel className="p-6 text-center" glow>
        <p className="text-sm text-muted-foreground">Revenue influenciado (demo)</p>
        <p className="text-4xl font-semibold mt-2 text-primary tabular-nums">
          ${content.revenueInfluencedAmount.toLocaleString("es-ES")}
        </p>
      </GlassPanel>

      <section className="space-y-4">
        <h3 className="text-sm font-medium">Participación en el journey (demo)</h3>
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            { label: "First touch", pct: touch.firstTouchPct },
            { label: "Middle touch", pct: touch.middleTouchPct },
            { label: "Last touch antes del DM", pct: touch.lastBeforeDmPct },
          ].map((t) => (
            <GlassPanel key={t.label} className="p-4">
              <p className="text-xs text-muted-foreground">{t.label}</p>
              <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${t.pct}%` }}
                />
              </div>
              <p className="mt-1 text-lg font-semibold">{t.pct}%</p>
            </GlassPanel>
          ))}
        </div>
      </section>
    </div>
  );
}
