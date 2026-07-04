import { AiCard } from "@ai-coo/ui";
import { FlowCta } from "@/components/shared/flow-cta";
import { es } from "@/lib/locale/es";
import { resolveExecutiveReportLink } from "@/lib/navigation/resolve-flow-link";

export function ExecutiveSummary({
  summary,
  detailHref,
  detailLabel,
}: {
  summary: string;
  detailHref?: string;
  detailLabel?: string;
}) {
  return (
    <div>
      <AiCard
        title="Resumen ejecutivo"
        confidence={0.94}
        source="Inputs semanales + Ventas + Operaciones"
        variant="insight"
      >
        {summary}
      </AiCard>
      <FlowCta
        href={detailHref ?? resolveExecutiveReportLink()}
        label={detailLabel ?? es.common.viewDetail}
      />
    </div>
  );
}
