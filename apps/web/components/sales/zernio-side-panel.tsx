"use client";

import { useState } from "react";
import { Badge, Button } from "@ai-coo/ui";
import { Loader2, Sparkles } from "lucide-react";
import { analyzeZernioConversationAction } from "@/app/integrations/zernio/actions";
import { useToast } from "@/providers/toast-provider";
import type { ZernioConversationWithAccount } from "@/app/integrations/zernio/actions";
import type { ZernioMessage } from "@/lib/zernio/client";

type AnalysisResult = {
  sentiment?: "positivo" | "neutral" | "negativo";
  qualification?: "alto" | "medio" | "bajo";
  painPoint?: string;
  recommendedAction?: string;
  ghostingRisk?: "alto" | "medio" | "bajo";
};

export function ZernioSidePanel({
  conversation,
  messages,
}: {
  conversation: ZernioConversationWithAccount;
  messages: ZernioMessage[];
}) {
  const { push } = useToast();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const result = await analyzeZernioConversationAction(
        conversation.participantName,
        conversation.platform,
        messages.map((m) => ({
          text: m.text,
          direction: m.direction,
          createdAt: m.createdAt,
        }))
      );
      if (result.success) {
        setAnalysis(result);
        push({ title: "Análisis completado", variant: "success" });
      } else {
        push({ title: "Error en análisis", description: result.error });
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const qualificationColor =
    analysis?.qualification === "alto"
      ? "success"
      : analysis?.qualification === "medio"
        ? "warning"
        : "destructive";

  const ghostColor =
    analysis?.ghostingRisk === "alto"
      ? "destructive"
      : analysis?.ghostingRisk === "medio"
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
          <dl className="grid grid-cols-2 gap-3 text-body">
            <div>
              <dt className="text-caption text-muted-foreground">Calificación</dt>
              <dd className="mt-1">
                <Badge variant={qualificationColor} className="capitalize">
                  {analysis.qualification}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-caption text-muted-foreground">Sentimiento</dt>
              <dd className="mt-1 text-sm font-medium capitalize">
                {analysis.sentiment}
              </dd>
            </div>
            <div>
              <dt className="text-caption text-muted-foreground">
                Riesgo fantasma
              </dt>
              <dd className="mt-1">
                <Badge variant={ghostColor} className="capitalize">
                  {analysis.ghostingRisk}
                </Badge>
              </dd>
            </div>
          </dl>

          {analysis.painPoint && (
            <div>
              <p className="text-caption text-muted-foreground">Dolor principal</p>
              <p className="mt-1 text-sm">{analysis.painPoint}</p>
            </div>
          )}

          {analysis.recommendedAction && (
            <div className="rounded-md border border-violet-500/20 bg-violet-500/5 p-3">
              <p className="text-caption font-medium text-violet-700 dark:text-violet-300">
                Próximo paso recomendado
              </p>
              <p className="mt-1 text-sm">{analysis.recommendedAction}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
