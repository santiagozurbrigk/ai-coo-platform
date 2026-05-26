"use client";

import { motion } from "framer-motion";
import { FlowCta } from "@/components/shared/flow-cta";
import { Panel } from "@/components/shared/panel";
import { Text } from "@ai-coo/ui";
import { es } from "@/lib/locale/es";
import { flowLinks } from "@/lib/navigation/flow-links";
import type {
  IntelligenceBottleneck,
  IntelligenceInsight,
  IntelligenceOpportunity,
  IntelligenceRecommendation,
  MemoryChunk,
} from "@/types/intelligence";
import { InsightCard } from "./insight-card";
import { RecommendationCard } from "./recommendation-card";
import { BottleneckCard } from "./bottleneck-card";
import { MemoryList } from "./memory-list";

const fade = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

function BlockHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <Text muted className="text-sm">{description}</Text>
    </div>
  );
}

export function IntelligenceOverview({
  insights,
  recommendations,
  bottlenecks,
  opportunities,
  memoryChunks,
}: {
  insights: IntelligenceInsight[];
  recommendations: IntelligenceRecommendation[];
  bottlenecks: IntelligenceBottleneck[];
  opportunities: IntelligenceOpportunity[];
  memoryChunks: MemoryChunk[];
}) {
  return (
    <motion.div
      className="space-y-12"
      initial="initial"
      animate="animate"
      variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
    >
      <motion.section id="insights" variants={fade} className="scroll-mt-6 space-y-4">
        <BlockHeader
          title="Insights"
          description="Patrones detectados en la operación — inteligencia con IA"
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {insights.map((i) => (
            <InsightCard key={i.id} insight={i} />
          ))}
        </div>
      </motion.section>

      <motion.section
        id="recommendations"
        variants={fade}
        className="scroll-mt-6 space-y-4"
      >
        <BlockHeader
          title="Recomendaciones"
          description="Acciones sugeridas a partir de datos y contexto"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {recommendations.map((r) => (
            <RecommendationCard key={r.id} item={r} />
          ))}
        </div>
      </motion.section>

      <motion.div
        variants={fade}
        className="grid gap-8 scroll-mt-6 lg:grid-cols-2"
      >
        <section id="bottlenecks" className="space-y-4">
          <BlockHeader
            title="Cuellos de botella"
            description="Fricción recurrente en la operación"
          />
          <div className="space-y-4">
            {bottlenecks.map((b) => (
              <BottleneckCard key={b.id} item={b} />
            ))}
          </div>
        </section>

        <section id="opportunities" className="space-y-4">
          <BlockHeader
            title="Oportunidades"
            description="Señales de crecimiento detectadas"
          />
          <div className="space-y-4">
            {opportunities.map((o) => (
              <Panel key={o.id}>
                <p className="font-medium text-sm">{o.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{o.potential}</p>
                <FlowCta
                  href={flowLinks.opportunity(o.id)}
                  label={es.common.takeAction}
                />
              </Panel>
            ))}
          </div>
        </section>
      </motion.div>

      <motion.section id="memoria" variants={fade} className="scroll-mt-6 space-y-4">
        <BlockHeader
          title="Memoria IA"
          description="Fragmentos del grafo de conocimiento organizacional"
        />
        <MemoryList chunks={memoryChunks} />
      </motion.section>
    </motion.div>
  );
}
