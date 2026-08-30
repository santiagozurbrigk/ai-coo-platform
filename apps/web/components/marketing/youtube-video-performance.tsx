"use client";

import Link from "next/link";
import {
  buildYoutubeCtaPerformance,
  generateCtaRetentionInsight,
} from "@/lib/marketing/youtube-cta-performance";
import type { ContentAssetView } from "@/app/marketing/actions";
import type { UTMLinkRow } from "@/types/utm";
import { paths } from "@/routes";
import { Panel } from "@/components/shared/panel";

export function YoutubeVideoPerformance({
  assets,
  utmLinks,
}: {
  assets: ContentAssetView[];
  utmLinks: UTMLinkRow[];
}) {
  const rows = buildYoutubeCtaPerformance(assets, utmLinks);
  if (rows.length < 3) return null;

  const insight = generateCtaRetentionInsight(rows);

  return (
    <Panel
      title="Rendimiento por video"
      subtitle="YouTube — retención hasta el CTA y atribución UTM"
    >
      {insight ? (
        <p className="mb-4 rounded-lg border border-brand-500/20 bg-brand-500/10 px-3 py-2 text-xs text-brand-100">
          {insight}
        </p>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] text-muted-foreground">
              <th className="px-2 py-2 font-medium">Video</th>
              <th className="px-2 py-2 text-right font-medium">Vistas</th>
              <th className="px-2 py-2 text-right font-medium">CTA en</th>
              <th className="px-2 py-2 text-right font-medium">Retención al CTA</th>
              <th className="px-2 py-2 text-right font-medium">Leads</th>
              <th className="px-2 py-2 text-right font-medium">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.assetId}
                className="border-b border-border/40 hover:bg-muted/20"
              >
                <td className="max-w-[200px] truncate px-2 py-2">
                  <Link
                    href={paths.platform.marketing.contentDetail(row.assetId)}
                    className="font-medium hover:text-brand-400"
                  >
                    {row.title}
                  </Link>
                </td>
                <td className="px-2 py-2 text-right tabular-nums">
                  {row.views.toLocaleString("es-ES")}
                </td>
                <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">
                  {row.ctaFormatted}
                </td>
                <td className="px-2 py-2 text-right tabular-nums font-medium">
                  {row.retentionPct}%
                </td>
                <td className="px-2 py-2 text-right tabular-nums">
                  {row.leadsAttributed}
                </td>
                <td className="px-2 py-2 text-right tabular-nums">
                  ${row.revenue.toLocaleString("es-ES")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
