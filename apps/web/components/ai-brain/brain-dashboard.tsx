"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AiCard, Badge, GlassPanel, Text } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import { paths } from "@/routes";
import type {
  BrainContentBreakdown,
  BrainCoverageArea,
  BrainGlobalInsight,
  BrainHealth,
  BrainRecentItem,
} from "@/types/ai-brain";
import { BrainStatusBadge } from "./brain-status-badge";
import { BrainTypeIcon } from "./brain-type-icon";

const fade = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

function HealthStatus({ health }: { health: BrainHealth }) {
  return (
    <GlassPanel className="p-6" glow>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Text muted className="text-xs uppercase tracking-wider">
            Estado del cerebro
          </Text>
          <div className="mt-2 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/40 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-lg font-semibold">Activo</span>
          </div>
        </div>
        <Badge variant="success">Capa global · todas las organizaciones</Badge>
      </div>
      <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Documentos cargados", health.documentsLoaded],
          ["Frameworks", health.frameworks],
          ["Transcripciones", health.transcripts],
          ["Imágenes", health.images],
          ["Miro Boards", health.miroBoards],
          ["Última actualización", health.lastUpdated],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
            <dt className="text-2xs text-muted-foreground">{label}</dt>
            <dd className="text-sm font-medium tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </GlassPanel>
  );
}

function ContentBreakdown({ items }: { items: BrainContentBreakdown[] }) {
  return (
    <Panel title="Distribución de contenido">
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.type} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <BrainTypeIcon type={item.type} />
                {item.label}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {item.count} · {item.pct}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/80 transition-all"
                style={{ width: `${item.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function CoverageAreas({ areas }: { areas: BrainCoverageArea[] }) {
  const icon = (level: BrainCoverageArea["level"]) => {
    if (level === "covered") return "✓";
    if (level === "partial") return "⚠";
    return "✗";
  };
  const variant = (level: BrainCoverageArea["level"]) => {
    if (level === "covered") return "text-emerald-400";
    if (level === "partial") return "text-amber-400";
    return "text-muted-foreground";
  };

  return (
    <Panel title="Áreas de cobertura IA">
      <div className="grid gap-2 sm:grid-cols-2">
        {areas.map((area) => (
          <div
            key={area.id}
            className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/10 px-3 py-2.5 text-sm"
          >
            <span>{area.label}</span>
            <span className={variant(area.level)}>
              {icon(area.level)}{" "}
              {area.level === "covered"
                ? `Cubierto (${area.docCount ?? 0} docs)`
                : area.level === "partial"
                  ? `Parcial (${area.docCount ?? 0} docs)`
                  : "Sin cobertura"}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function RecentAdded({ items }: { items: BrainRecentItem[] }) {
  return (
    <Panel title="Añadidos recientemente">
      <ul className="divide-y divide-border/50">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={paths.superAdmin.aiBrain.document(item.id)}
              className="flex flex-wrap items-center justify-between gap-2 py-3 transition-colors hover:text-primary"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-sm">{item.title}</p>
                <p className="text-2xs text-muted-foreground">
                  {item.uploadedBy} · {item.uploadDate}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <BrainTypeIcon type={item.type} />
                <BrainStatusBadge status={item.status} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function BrainDashboard({
  health,
  breakdown,
  coverage,
  insights,
  recent,
  statusCounts,
  phase2Note,
}: {
  health: BrainHealth;
  breakdown: BrainContentBreakdown[];
  coverage: BrainCoverageArea[];
  insights: BrainGlobalInsight[];
  recent: BrainRecentItem[];
  statusCounts?: {
    active: number;
    pending: number;
    archived: number;
    error: number;
  };
  phase2Note?: boolean;
}) {
  return (
    <motion.div
      className="space-y-8"
      initial="initial"
      animate="animate"
      variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
    >
      {phase2Note && (
        <motion.div variants={fade}>
          <GlassPanel className="border-amber-500/20 bg-amber-500/5 p-4">
            <p className="text-sm text-muted-foreground">
              Los documentos cargados aquí estarán disponibles para el motor de IA
              en Phase 2. Actualmente se almacenan y categorizan pero no están
              siendo procesados por ningún modelo.
            </p>
          </GlassPanel>
        </motion.div>
      )}

      {statusCounts && (
        <motion.div variants={fade} className="grid gap-3 sm:grid-cols-4">
          {[
            ["Activos", statusCounts.active],
            ["Pendientes de indexar", statusCounts.pending],
            ["Archivados", statusCounts.archived],
            ["Con error", statusCounts.error],
          ].map(([label, value]) => (
            <div
              key={label as string}
              className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2"
            >
              <p className="text-2xs text-muted-foreground">{label}</p>
              <p className="text-lg font-semibold tabular-nums">{value}</p>
            </div>
          ))}
        </motion.div>
      )}

      <motion.div variants={fade}>
        <HealthStatus health={health} />
      </motion.div>

      <motion.div variants={fade} className="grid gap-4 lg:grid-cols-2">
        <ContentBreakdown items={breakdown} />
        <CoverageAreas areas={coverage} />
      </motion.div>

      <motion.div variants={fade}>
        <RecentAdded items={recent} />
      </motion.div>

      <motion.div variants={fade} className="grid gap-4 lg:grid-cols-2">
        {insights.map((insight) => (
          <AiCard
            key={insight.id}
            title={insight.title}
            confidence={insight.tone === "positive" ? 92 : 68}
            source="Cerebro de IA general · Capa global"
          >
            {insight.body}
          </AiCard>
        ))}
      </motion.div>

      <motion.p variants={fade} className="text-center text-2xs text-muted-foreground">
        Capa 1 (cerebro global) + Capa 2 (contexto por organización) → outputs expertos y
        personalizados
      </motion.p>
    </motion.div>
  );
}
