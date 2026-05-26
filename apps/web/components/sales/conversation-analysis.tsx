import { Panel } from "@/components/shared/panel";
import { AiCard, Badge } from "@ai-coo/ui";
import type { ConversationAnalysis } from "@/types/sales";

export function ConversationAnalysisPanel({
  analysis,
}: {
  analysis: ConversationAnalysis;
}) {
  const ghostVariant =
    analysis.ghostingRisk === "high"
      ? "destructive"
      : analysis.ghostingRisk === "medium"
        ? "warning"
        : "success";

  return (
    <div className="space-y-4 p-4">
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
            <dd className="font-medium mt-1">
              {analysis.bookingSignal ? "Detectada" : "Ninguna"}
            </dd>
          </div>
        </dl>
      </Panel>

      <AiCard title="Insights de la conversación" confidence={0.85}>
        <ul className="list-disc pl-4 space-y-1">
          {analysis.insights.map((insight, i) => (
            <li key={i}>{insight}</li>
          ))}
        </ul>
      </AiCard>
    </div>
  );
}
