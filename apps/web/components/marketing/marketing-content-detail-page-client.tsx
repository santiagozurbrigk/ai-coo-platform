"use client";

import { useMemo } from "react";
import { ContentPieceDetail } from "@/components/marketing/content-piece-detail";
import { PageContextRegistrar } from "@/providers";
import type { ContentMetrics, ContentPieceWithVariants } from "@/types/content";

type Props = {
  piece: ContentPieceWithVariants;
  variants: ContentPieceWithVariants["variants"];
  orgAvg?: ContentMetrics | null;
};

export function MarketingContentDetailPageClient({ piece, variants, orgAvg }: Props) {
  const pageContext = useMemo(
    () => ({
      entityType: "content_piece" as const,
      entityId: piece.id,
      entityData: {
        title: piece.title ?? piece.caption ?? null,
        type: piece.type,
        platform: piece.platform ?? null,
        platform_post_id: piece.platform_post_id ?? null,
        published_at: piece.published_at ?? null,
        analysis_summary: piece.analysis
          ? {
              formato: piece.analysis.formato?.name,
              dolor: piece.analysis.dolor?.name,
              angulo: piece.analysis.angulo?.name,
            }
          : null,
      },
    }),
    [piece]
  );

  return (
    <PageContextRegistrar context={pageContext}>
      <ContentPieceDetail
        piece={piece}
        variants={variants ?? piece.variants ?? []}
        orgAvg={orgAvg ?? null}
      />
    </PageContextRegistrar>
  );
}
