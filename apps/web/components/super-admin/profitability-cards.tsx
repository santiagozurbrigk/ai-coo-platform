import { MetricCard } from "@ai-coo/ui";

export function ProfitabilityCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <MetricCard title="MRR plataforma" value="$144.2K" trend="up" trendValue="+12%" />
      <MetricCard title="Costos totales IA" value="$245" subtitle="Este mes" />
      <MetricCard title="Margen bruto" value="98,3%" trend="neutral" />
    </div>
  );
}
