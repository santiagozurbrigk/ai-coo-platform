"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AiCard } from "@ai-coo/ui";
import { paths } from "@/routes";
import type {
  BuyerJourneyPattern,
  ContentAsset,
  InfluenceRankItem,
  MarketingAiInsight,
} from "@/types/marketing-insights";
import { DriveSourceBanner } from "./drive-source-banner";
import { InfluenceRankList } from "./influence-rank-list";
import { JourneyFlowVisual } from "./journey-flow-visual";
import { ContentFunnel } from "./content-funnel";
import { ContentThumbnail } from "./content-thumbnail";
import { Panel } from "@/components/shared/panel";

const fade = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

export function MarketingDashboard({
  assets,
  bookingInfluence,
  salesInfluence,
  commonJourney,
  funnel,
  insights,
}: {
  assets: ContentAsset[];
  bookingInfluence: InfluenceRankItem[];
  salesInfluence: InfluenceRankItem[];
  commonJourney: BuyerJourneyPattern;
  funnel: { stage: string; value: number; pct: number }[];
  insights: MarketingAiInsight[];
}) {
  const topAssets = [...assets]
    .sort((a, b) => b.bookingsInfluenced - a.bookingsInfluenced)
    .slice(0, 6);

  return (
    <motion.div
      className="space-y-8"
      initial="initial"
      animate="animate"
      variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
    >
      <motion.div variants={fade}>
        <DriveSourceBanner />
      </motion.div>

      <motion.div variants={fade} className="grid gap-4 lg:grid-cols-2">
        <InfluenceRankList
          title="Contenido que más agendamientos influencia"
          items={bookingInfluence}
          assets={assets}
        />
        <InfluenceRankList
          title="Contenido que más ventas influencia"
          items={salesInfluence}
          assets={assets}
        />
      </motion.div>

      <motion.div variants={fade} className="grid gap-4 lg:grid-cols-2">
        <JourneyFlowVisual pattern={commonJourney} />
        <ContentFunnel stages={funnel} />
      </motion.div>

      <motion.div variants={fade}>
        <Panel
          title="Top assets de contenido"
          contentClassName="grid grid-cols-2 gap-3 sm:grid-cols-3"
        >
          {topAssets.map((asset) => (
            <Link
              key={asset.id}
              href={paths.platform.sales.marketingInsights.content(asset.id)}
              className="transition-opacity hover:opacity-90"
            >
              <ContentThumbnail content={asset} size="md" />
              <p className="mt-2 text-2xs text-muted-foreground">
                {asset.bookingsInfluenced} agend. · {asset.salesInfluenced} ventas
              </p>
            </Link>
          ))}
        </Panel>
      </motion.div>

      <motion.div variants={fade} className="grid gap-4 lg:grid-cols-2">
        {insights.map((insight) => (
          <AiCard
            key={insight.id}
            title={insight.title}
            confidence={insight.confidence}
            source="Inteligencia de contenido · Google Drive"
          >
            {insight.body}
          </AiCard>
        ))}
      </motion.div>
    </motion.div>
  );
}
