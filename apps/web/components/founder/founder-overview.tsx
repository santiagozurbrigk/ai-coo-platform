import { AiCard, MetricCard } from "@ai-coo/ui";
import { Panel } from "@/components/shared";

export function FounderOverview() {
  return (
    <div className="space-y-8">
      <AiCard title="Briefing del fundador" confidence={0.95} source="Todos los módulos · Esta semana">
        Sigues siendo el cuello de botella en QA de ventas (40% de revisión). Delivery es
        el departamento de mayor riesgo. Prioriza actualizar el SOP y cobertura de setters
        el fin de semana antes del lanzamiento de la cohorte de junio.
      </AiCard>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Tiempo ahorrado"
          value="6,2 h"
          trend="up"
          trendValue="vs semana anterior"
        />
        <MetricCard title="Decisiones pendientes" value="3" />
        <MetricCard title="Salud organizacional" value="78" trend="down" trendValue="-4" />
      </div>

      <Panel title="Prioridades estratégicas">
        <ol className="list-decimal pl-4 space-y-2 text-sm text-muted-foreground">
          <li>Reducir dependencia del fundador en aprobación de guiones</li>
          <li>Estabilizar onboarding Módulo 2 antes de escalar</li>
          <li>Completar importación de contexto desde Fathom + Notion</li>
        </ol>
      </Panel>
    </div>
  );
}
