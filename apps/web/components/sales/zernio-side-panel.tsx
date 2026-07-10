"use client";

import { useEffect, useState } from "react";
import { Badge, Button, cn } from "@ai-coo/ui";
import { Loader2, Sparkles } from "lucide-react";
import {
  analyzeZernioConversationAction,
  type ZernioAnalysisResult,
  type ZernioAnalysisSummary,
  type ZernioConversationWithAccount,
} from "@/app/integrations/zernio/actions";
import { useToast } from "@/providers/toast-provider";
import type { ZernioMessage } from "@/lib/zernio/client";

const TAG_CONFIG: Record<string, { label: string; className: string }> = {
  caliente: { label: "🔥 Caliente", className: "bg-red-500/15 text-red-500" },
  tibio: { label: "🌡 Tibio", className: "bg-orange-500/15 text-orange-500" },
  frio: { label: "❄️ Frío", className: "bg-blue-500/15 text-blue-500" },
  agendado: { label: "✅ Agendado", className: "bg-green-500/15 text-green-500" },
  no_interesado: {
    label: "✗ No interesado",
    className: "bg-muted text-muted-foreground",
  },
};

type AnalysisState = Omit<ZernioAnalysisResult, "success" | "error"> | null;

function savedToAnalysis(saved?: ZernioAnalysisSummary): AnalysisState {
  if (!saved) return null;
  return { ...saved };
}

export function ZernioSidePanel({
  conversation,
  messages,
  savedAnalysis,
  onAnalysisUpdated,
}: {
  conversation: ZernioConversationWithAccount;
  messages: ZernioMessage[];
  savedAnalysis?: ZernioAnalysisSummary;
  onAnalysisUpdated?: (conversationId: string, summary: ZernioAnalysisSummary) => void;
}) {
  const { push } = useToast();
  const [analysis, setAnalysis] = useState<AnalysisState>(() =>
    savedToAnalysis(savedAnalysis)
  );
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    setAnalysis(savedToAnalysis(savedAnalysis));
  }, [conversation.id, savedAnalysis]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const result = await analyzeZernioConversationAction(
        conversation.id,
        conversation.accountId,
        conversation.participantName,
        conversation.platform,
        messages.map((m) => ({
          text: m.text,
          direction: m.direction,
          createdAt: m.createdAt,
        }))
      );
      if (result.success) {
        const { success: _s, error: _e, ...rest } = result;
        setAnalysis(rest);
        onAnalysisUpdated?.(conversation.id, {
          ai_tag: rest.ai_tag,
          ai_status: rest.ai_status,
          ai_qualification: rest.ai_qualification,
          ai_ghosting_risk: rest.ai_ghosting_risk,
          agenda_sent: rest.agenda_sent,
          is_scheduled: rest.is_scheduled,
        });
      } else {
        push({ title: "Error en análisis", description: result.error });
      }
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    if (messages.length >= 3 && !analysis && !analyzing) {
      void handleAnalyze();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, conversation.id]);

  const tagConfig = analysis?.ai_tag ? TAG_CONFIG[analysis.ai_tag] : null;

  const qualificationColor =
    analysis?.ai_qualification === "alto"
      ? "success"
      : analysis?.ai_qualification === "medio"
        ? "warning"
        : "destructive";

  const ghostColor =
    analysis?.ai_ghosting_risk === "alto"
      ? "destructive"
      : analysis?.ai_ghosting_risk === "medio"
        ? "warning"
        : "success";

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-y-auto p-[var(--space-card-sm)]">
      <div className="mb-[var(--space-card-sm)] flex items-center gap-2">
        <Sparkles className="h-4 w-4 shrink-0 text-primary" />
        <h2 className="text-sm font-medium">Análisis IA</h2>
      </div>

      <div className="mb-4 rounded-md border border-border bg-muted/30 p-3">
        <p className="text-sm font-medium">{conversation.participantName}</p>
        <p className="text-xs capitalize text-muted-foreground">
          {conversation.platform}
        </p>
        {tagConfig && (
          <span
            className={cn(
              "mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
              tagConfig.className
            )}
          >
            {tagConfig.label}
          </span>
        )}
        {conversation.instagramProfile && (
          <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-muted-foreground">
            <span>
              {conversation.instagramProfile.followerCount.toLocaleString("es")}{" "}
              seguidores
            </span>
            <span>
              {conversation.instagramProfile.isFollowing ? "Te sigue ✓" : ""}
            </span>
          </div>
        )}
        <p className="mt-1 text-[11px] text-muted-foreground">
          {messages.length} mensajes
        </p>
      </div>

      {analyzing && !analysis && (
        <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Analizando conversación…
        </div>
      )}

      {messages.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Abrí una conversación para analizar.
        </p>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="w-full gap-2"
          disabled={analyzing || messages.length === 0}
          onClick={() => void handleAnalyze()}
        >
          {analyzing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          {analyzing
            ? "Analizando…"
            : analysis
              ? "Re-analizar con IA"
              : "Analizar con IA"}
        </Button>
      )}

      {analysis && (
        <div className="mt-4 space-y-4">
          {analysis.ai_status && (
            <div>
              <p className="text-caption text-muted-foreground">Estado del lead</p>
              <p className="mt-1 text-sm font-medium capitalize">
                {analysis.ai_status.replace(/_/g, " ")}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {analysis.is_scheduled && (
              <Badge variant="success" className="text-[10px]">
                Reunión agendada
              </Badge>
            )}
            {analysis.agenda_sent && (
              <Badge variant="outline" className="text-[10px]">
                Link de agenda enviado
              </Badge>
            )}
            {analysis.link_sent && (
              <Badge variant="outline" className="text-[10px]">
                Link de ventas enviado
              </Badge>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-3 text-body">
            <div>
              <dt className="text-caption text-muted-foreground">Calificación</dt>
              <dd className="mt-1">
                <Badge variant={qualificationColor} className="capitalize">
                  {analysis.ai_qualification}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-caption text-muted-foreground">Sentimiento</dt>
              <dd className="mt-1 text-sm font-medium capitalize">
                {analysis.ai_sentiment}
              </dd>
            </div>
            <div>
              <dt className="text-caption text-muted-foreground">
                Riesgo fantasma
              </dt>
              <dd className="mt-1">
                <Badge variant={ghostColor} className="capitalize">
                  {analysis.ai_ghosting_risk}
                </Badge>
              </dd>
            </div>
          </dl>

          {analysis.ai_summary && (
            <div>
              <p className="text-caption text-muted-foreground">Resumen</p>
              <p className="mt-1 text-sm">{analysis.ai_summary}</p>
            </div>
          )}

          {analysis.ai_pain_point && (
            <div>
              <p className="text-caption text-muted-foreground">Dolor principal</p>
              <p className="mt-1 text-sm">{analysis.ai_pain_point}</p>
            </div>
          )}

          {analysis.ai_recommended_action && (
            <div className="rounded-md border border-violet-500/20 bg-violet-500/5 p-3">
              <p className="text-caption font-medium text-violet-700 dark:text-violet-300">
                Próximo paso recomendado
              </p>
              <p className="mt-1 text-sm">{analysis.ai_recommended_action}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
