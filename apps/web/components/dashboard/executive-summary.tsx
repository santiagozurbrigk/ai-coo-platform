import { AiCard } from "@ai-coo/ui";
import { FlowCta } from "@/components/shared/flow-cta";
import { es } from "@/lib/locale/es";
import { flowLinks } from "@/lib/navigation/flow-links";

export function ExecutiveSummary({ summary }: { summary: string }) {
  return (
    <div>
      <AiCard
        title="Resumen ejecutivo"
        confidence={0.94}
        source="Inputs semanales + Ventas + Operaciones"
      >
        {summary}
      </AiCard>
      <FlowCta
        href={flowLinks.executiveReportLatest}
        label={es.common.viewDetail}
      />
    </div>
  );
}
