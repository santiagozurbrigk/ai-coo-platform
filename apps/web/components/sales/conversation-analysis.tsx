"use client";

import { useState } from "react";
import { Badge, Button } from "@ai-coo/ui";
import { Instagram, Loader2, Sparkles } from "lucide-react";
import { analyzeConversationAction } from "@/app/conversations/actions";
import { CONVERSATION_TAG_CONFIG } from "@/constants/conversation-tags";
import { usePlatformData } from "@/providers";
import { useToast } from "@/providers/toast-provider";
import { getFunnelStageLabel } from "@/lib/manychat/conversation-scoring-prompt";
import type { Conversation } from "@/types/sales";

function AnalyzeButton({
  conversationId,
  hasAiScore,
}: {
  conversationId: string;
  hasAiScore: boolean;
}) {
  const { refreshConversations } = usePlatformData();
  const { push } = useToast();
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const result = await analyzeConversationAction(conversationId);
      if (result.success) {
        await refreshConversations();
        push({ title: "Análisis actualizado", variant: "success" });
      } else {
        push({
          title: "No se pudo analizar",
          description: result.error,
          variant: "default",
        });
      }
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      className="w-full gap-2"
      disabled={analyzing}
      onClick={() => void handleAnalyze()}
    >
      {analyzing ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Sparkles className="h-3.5 w-3.5" />
      )}
      {analyzing
        ? "Analizando…"
        : hasAiScore
          ? "Re-analizar con IA"
          : "Analizar ahora con IA"}
    </Button>
  );
}

function BoolFlag({ label, value }: { label: string; value?: boolean }) {
  if (!value) return null;
  return (
    <Badge variant="outline" className="text-2xs">
      {label}
    </Badge>
  );
}

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

  const hasAiScore = conversation.aiScore != null;
  const displayTag = conversation.tag ?? conversation.aiTag;
  const tagMeta = displayTag ? CONVERSATION_TAG_CONFIG[displayTag] : null;

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-y-auto p-[var(--space-card-sm)]">
      <div className="mb-[var(--space-card-sm)] flex items-center gap-2">
        <Sparkles className="h-4 w-4 shrink-0 text-primary" />
        <h2 className="text-sm font-medium">Análisis IA</h2>
      </div>

      {!hasAiScore ? (
        <p className="mb-3 text-body text-muted-foreground">
          Se dispara automáticamente con 3+ mensajes, o analizala ahora.
        </p>
      ) : null}

      <AnalyzeButton
        conversationId={conversation.id}
        hasAiScore={hasAiScore}
      />

      {hasAiScore ? (
        <div className="mt-4 space-y-4">
          {conversation.aiSummary ? (
            <p className="text-body text-muted-foreground">
              {conversation.aiSummary}
            </p>
          ) : null}

          <dl className="grid grid-cols-2 gap-3 text-body">
            {tagMeta ? (
              <div className="col-span-2">
                <dt className="text-caption text-muted-foreground">
                  Etiqueta IA
                </dt>
                <dd className="mt-1">
                  <span className={tagMeta.className} style={tagMeta.style}>
                    {tagMeta.label}
                  </span>
                </dd>
              </div>
            ) : null}

            {conversation.aiPainPoint ? (
              <div className="col-span-2">
                <dt className="text-caption text-muted-foreground">
                  Dolor principal
                </dt>
                <dd className="mt-1 font-medium">{conversation.aiPainPoint}</dd>
              </div>
            ) : null}

            {conversation.aiFunnelStage ? (
              <div className="col-span-2">
                <dt className="text-caption text-muted-foreground">
                  Etapa del proceso
                </dt>
                <dd className="mt-1 font-medium">
                  {getFunnelStageLabel(conversation.aiFunnelStage)}
                </dd>
              </div>
            ) : null}

            <div>
              <dt className="text-caption text-muted-foreground">
                Tiempo de respuesta
              </dt>
              <dd className="font-medium">{analysis.responseTimeMinutes} min</dd>
            </div>
            <div>
              <dt className="text-caption text-muted-foreground">
                Riesgo de fantasma
              </dt>
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
              <dt className="text-caption text-muted-foreground">
                Señal de agendamiento
              </dt>
              <dd className="mt-1 font-medium">
                {analysis.bookingSignal ? "Detectada" : "Ninguna"}
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-2">
            <BoolFlag label="Link compartido" value={conversation.aiLinkShared} />
            <BoolFlag
              label="WhatsApp compartido"
              value={conversation.aiWhatsappNumberShared}
            />
            <BoolFlag
              label="Link de agendamiento"
              value={conversation.aiBookingLinkShared}
            />
          </div>

          {conversation.aiCrossChannelSource &&
          conversation.aiCrossChannelSummary ? (
            <div className="rounded-md border border-border bg-muted/30 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-caption font-medium text-muted-foreground">
                <Instagram className="h-3.5 w-3.5 text-pink-400" />
                Este lead vino de Instagram
              </div>
              <p className="text-body text-muted-foreground">
                {conversation.aiCrossChannelSummary}
              </p>
            </div>
          ) : null}

          {conversation.aiBookingSignals?.length ? (
            <div>
              <p className="text-caption text-muted-foreground">
                Señales de agendamiento
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-body text-muted-foreground">
                {conversation.aiBookingSignals.map((signal) => (
                  <li key={signal}>{signal}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {analysis.ghostingRisk === "high" &&
          conversation.aiGhostingSignals?.length ? (
            <div>
              <p className="text-caption font-medium text-destructive">
                Riesgo de fantasma alto
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-body text-muted-foreground">
                {conversation.aiGhostingSignals.map((signal) => (
                  <li key={signal}>{signal}</li>
                ))}
              </ul>
            </div>
          ) : conversation.aiGhostingSignals?.length ? (
            <div>
              <p className="text-caption text-muted-foreground">
                Señales de riesgo
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-body text-muted-foreground">
                {conversation.aiGhostingSignals.map((signal) => (
                  <li key={signal}>{signal}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {conversation.aiDetectedObjections?.length ? (
            <div>
              <p className="text-caption text-muted-foreground">
                Objeciones detectadas
              </p>
              <ul className="mt-1 space-y-2 text-body">
                {conversation.aiDetectedObjections.map((objection) => (
                  <li key={`${objection.category}-${objection.text}`}>
                    <span className="text-muted-foreground">
                      {objection.text}
                    </span>
                    <Badge
                      variant="outline"
                      className="ml-2 text-2xs capitalize"
                    >
                      {objection.category}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {conversation.aiRecommendedAction ? (
            <div className="rounded-md border border-brand-500/20 bg-brand-500/5 p-3">
              <p className="text-caption font-medium text-brand-700 dark:text-brand-300">
                Próximo paso recomendado
              </p>
              <p className="mt-1 text-body">{conversation.aiRecommendedAction}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
