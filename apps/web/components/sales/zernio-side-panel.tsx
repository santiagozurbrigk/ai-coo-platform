"use client";

import { useEffect, useState } from "react";
import { Badge, Button, cn } from "@ai-coo/ui";
import { AlertTriangle, ClipboardCopy, Loader2, Sparkles } from "lucide-react";
import {
  analyzeZernioConversationAction,
  type ZernioAnalysisResult,
  type ZernioAnalysisSummary,
  type ZernioConversationWithAccount,
} from "@/app/integrations/zernio/actions";
import { useToast } from "@/providers/toast-provider";
import type { ZernioMessage } from "@/lib/zernio/client";
import { LeadJourneyInline } from "./lead-journey-inline";

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
          scheduling_process_missing: rest.scheduling_process_missing,
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
          {/* Score card */}
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-2.5">
            {/* Qualification bar */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-muted-foreground">Calificación</span>
                <Badge variant={qualificationColor} className="capitalize text-[10px]">
                  {analysis.ai_qualification}
                </Badge>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    analysis.ai_qualification === "alto"
                      ? "w-full bg-green-500"
                      : analysis.ai_qualification === "medio"
                        ? "w-2/3 bg-yellow-500"
                        : "w-1/3 bg-red-500"
                  )}
                />
              </div>
            </div>

            {/* Ghost risk bar */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-muted-foreground">Riesgo fantasma</span>
                <Badge variant={ghostColor} className="capitalize text-[10px]">
                  {analysis.ai_ghosting_risk}
                </Badge>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    analysis.ai_ghosting_risk === "alto"
                      ? "w-full bg-red-500"
                      : analysis.ai_ghosting_risk === "medio"
                        ? "w-2/3 bg-yellow-500"
                        : "w-1/3 bg-green-500"
                  )}
                />
              </div>
            </div>

            {/* Sentiment + status row */}
            <div className="flex items-center justify-between pt-0.5 border-t border-border/40">
              {analysis.ai_sentiment && (
                <span className="text-[11px] capitalize text-muted-foreground">
                  Sentimiento:{" "}
                  <span className="font-medium text-foreground">{analysis.ai_sentiment}</span>
                </span>
              )}
              {analysis.ai_status && (
                <span className="text-[11px] capitalize text-muted-foreground">
                  {analysis.ai_status.replace(/_/g, " ")}
                </span>
              )}
            </div>
          </div>

          {/* Status badges */}
          {(analysis.is_scheduled || analysis.agenda_sent || analysis.link_sent) && (
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
          )}

          {analysis.ai_summary && (
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Resumen</p>
              <p className="mt-1 text-xs leading-relaxed">{analysis.ai_summary}</p>
            </div>
          )}

          {analysis.ai_pain_point && (
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Dolor principal</p>
              <p className="mt-1 text-xs leading-relaxed">{analysis.ai_pain_point}</p>
            </div>
          )}

          {analysis.ai_recommended_action && (
            <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3">
              <p className="text-[11px] font-semibold text-violet-600 dark:text-violet-400">
                Próximo paso
              </p>
              <p className="mt-1 text-xs leading-relaxed">{analysis.ai_recommended_action}</p>
            </div>
          )}

          {analysis.scheduling_process_missing && (
            <div className="flex gap-2 rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="text-[11px] font-medium text-yellow-700 dark:text-yellow-300">
                  Sin proceso de agendamiento
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Creá un SOP con ese título para que la IA guíe mejor al setter.
                </p>
              </div>
            </div>
          )}

          {analysis.suggested_next_message && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold text-primary">
                  Mensaje sugerido
                </p>
                <button
                  type="button"
                  className="group flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-primary/70 transition-colors hover:bg-primary/10 hover:text-primary"
                  onClick={() =>
                    void navigator.clipboard.writeText(
                      analysis.suggested_next_message ?? ""
                    )
                  }
                >
                  <ClipboardCopy className="h-3 w-3" />
                  Copiar
                </button>
              </div>
              <p className="mt-1.5 text-xs italic leading-relaxed text-foreground/80">
                &ldquo;{analysis.suggested_next_message}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recorrido del lead */}
      <div className="mt-4 border-t border-border pt-4">
        <LeadJourneyInline
          leadName={conversation.participantName}
          zernioAccountId={conversation.accountId}
          zernioParticipantId={conversation.participantId}
          zernioParticipantName={conversation.participantName}
        />
      </div>
    </div>
  );
}
