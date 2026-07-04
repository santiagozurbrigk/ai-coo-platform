import { Sparkles } from "lucide-react";
import { AiCard } from "@ai-coo/ui";
import { FlowCta } from "@/components/shared/flow-cta";
import { resolveExecutiveReportLink } from "@/lib/navigation/resolve-flow-link";

export function OperationsExecutiveReport({
  paragraphs,
  generatedAt,
}: {
  paragraphs: string[];
  generatedAt?: string | null;
}) {
  const generatedLabel = generatedAt
    ? `Generado ${new Date(generatedAt).toLocaleString("es", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : "Generado con IA";
  return (
    <div>
      <AiCard
        title="Reporte ejecutivo operacional"
        confidence={0.91}
        source="Inputs semanales + métricas de ventas + delivery"
        variant="default"
      >
        <div className="space-y-3 text-sm leading-relaxed text-foreground/90">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </AiCard>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        <FlowCta
          href={resolveExecutiveReportLink()}
          label="Ver reporte completo"
        />
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-violet-400" />
          {generatedLabel}
        </span>
      </div>
    </div>
  );
}
