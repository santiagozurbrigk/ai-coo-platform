"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge, Button, GlassPanel } from "@ai-coo/ui";
import type { ContentAssetView } from "@/app/marketing/actions";
import { paths } from "@/routes";
import { ContentPlatformMetrics } from "@/components/marketing/content-platform-metrics";

export function MarketingContentDetail({
  asset,
}: {
  asset: ContentAssetView;
}) {
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

      <section className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Métricas {asset.platform === "youtube" ? "de YouTube" : "de Instagram"}
        </h3>
        <ContentPlatformMetrics asset={asset} />
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { label: "Conversaciones", value: asset.conversationsGenerated },
          { label: "Bookings", value: asset.bookingsInfluenced },
          { label: "Revenue infl.", value: asset.revenueInfluenced },
        ].map((m) => (
          <GlassPanel key={m.label} className="p-3 text-center">
            <p className="text-2xs text-muted-foreground">{m.label}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {typeof m.value === "number" && m.label === "Revenue infl."
                ? `$${m.value.toLocaleString("es-ES")}`
                : m.value.toLocaleString("es-ES")}
            </p>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
