import { Panel } from "@/components/shared/panel";
import { AiCard, Badge } from "@ai-coo/ui";
import { Youtube } from "lucide-react";
import type { Conversation } from "@/types/sales";
import { getQualificationTierLabel } from "@/lib/sales/qualification-score";
import { LeadQualificationBadge } from "./lead-qualification-badge";

const AI_LABEL_COPY: Record<
  NonNullable<Conversation["aiLabel"]>,
  { label: string; variant: "success" | "warning" | "destructive" }
> = {
  hot: { label: "Hot", variant: "success" },
  warm: { label: "Warm", variant: "warning" },
  cold: { label: "Cold", variant: "destructive" },
  unqualified: { label: "No calificado", variant: "destructive" },
};

export function ConversationAnalysisPanel({
  conversation,
}: {
  conversation: Conversation;
}) {
  const analysis = conversation.analysis;
  const ghostVariant =
    analysis.ghostingRisk === "high"
      ? "destructive"
      : analysis.ghostingRisk === "medium"
        ? "warning"
        : "success";

  const score = analysis.qualificationScore;
  const hasAiScore = conversation.aiScore != null;
  const labelMeta = conversation.aiLabel
    ? AI_LABEL_COPY[conversation.aiLabel]
    : null;

  return (
    <div className="space-y-4 p-4">
      {conversation.sourceVideoTitle ? (
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Youtube className="h-3 w-3 shrink-0" />
          <span className="truncate">Vino de: {conversation.sourceVideoTitle}</span>
        </div>
      ) : null}

      {!hasAiScore ? (
        <div className="text-[12px] italic text-muted-foreground">
          Análisis disponible después de 3+ mensajes
        </div>
      ) : null}

      {score ? (
        <Panel title="Calificación del lead">
          <div className="flex flex-wrap items-center gap-3">
            <LeadQualificationBadge score={score} />
            {labelMeta ? (
              <Badge variant={labelMeta.variant}>{labelMeta.label}</Badge>
            ) : null}
            <span className="text-xs text-muted-foreground">
              {getQualificationTierLabel(score.tier)} — score automático
            </span>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Engagement</dt>
              <dd className="font-medium tabular-nums">{score.engagement}/100</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Intent</dt>
              <dd className="font-medium tabular-nums">{score.intent}/100</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Qualification</dt>
              <dd className="font-medium tabular-nums">
                {score.qualification}/100
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Score final</dt>
              <dd className="font-semibold tabular-nums text-violet-300">
                {score.overall}/100
              </dd>
            </div>
          </dl>
        </Panel>
      ) : null}

      {conversation.aiSummary ? (
        <Panel title="Resumen IA">
          <p className="text-sm text-muted-foreground">{conversation.aiSummary}</p>
        </Panel>
      ) : null}

      <Panel title="Análisis">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground text-xs">Tiempo de respuesta</dt>
            <dd className="font-medium">{analysis.responseTimeMinutes} min</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Riesgo de fantasma</dt>
            <dd>
              <Badge variant={ghostVariant} className="mt-1 capitalize">
                {analysis.ghostingRisk === "high"
                  ? "Alto"
                  : analysis.ghostingRisk === "medium"
                    ? "Medio"
                    : "Bajo"}
              </Badge>
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-muted-foreground text-xs">Señal de agendamiento</dt>
            <dd className="mt-1 font-medium">
              {analysis.bookingSignal ? "Detectada" : "Ninguna"}
            </dd>
          </div>
        </dl>
      </Panel>

      {conversation.aiBookingSignals?.length ? (
        <Panel title="Señales de agendamiento">
          <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
            {conversation.aiBookingSignals.map((signal) => (
              <li key={signal}>{signal}</li>
            ))}
          </ul>
        </Panel>
      ) : null}

      {conversation.aiGhostingSignals?.length ? (
        <Panel title="Señales de riesgo">
          <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
            {conversation.aiGhostingSignals.map((signal) => (
              <li key={signal}>{signal}</li>
            ))}
          </ul>
        </Panel>
      ) : null}

      {conversation.aiDetectedObjections?.length ? (
        <Panel title="Objeciones detectadas">
          <ul className="space-y-2 text-sm">
            {conversation.aiDetectedObjections.map((objection) => (
              <li key={`${objection.category}-${objection.text}`}>
                <span className="text-muted-foreground">{objection.text}</span>
                <Badge variant="outline" className="ml-2 text-2xs capitalize">
                  {objection.category}
                </Badge>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      {conversation.aiRecommendedAction ? (
        <AiCard title="Acción recomendada" confidence={0.85}>
          <p className="text-sm">{conversation.aiRecommendedAction}</p>
        </AiCard>
      ) : null}

      {analysis.insights.length > 0 && !hasAiScore ? (
        <AiCard title="Insights de la conversación" confidence={0.85}>
          <ul className="list-disc space-y-1 pl-4">
            {analysis.insights.map((insight, i) => (
              <li key={i}>{insight}</li>
            ))}
          </ul>
        </AiCard>
      ) : null}
    </div>
  );
}
