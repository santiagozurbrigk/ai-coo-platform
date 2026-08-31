"use client";

import {
  CategoryBarChart,
  ChartShell,
  DualAreaChart,
  FunnelChartPanel,
  GaugeMetricChart,
  GaugeTargetChart,
  HeroAreaChart,
  InteractiveDualAreaChart,
  MetricChartPanel,
  MiniMetricChart,
  PieDistributionChart,
  RadarPerformanceChart,
  RingDistributionChart,
  SparklineChart,
  StackedBarChart,
  TrendLineChart,
} from "@/components/charts/platform";

const series = [
  { label: "1 ago", value: 42 },
  { label: "5 ago", value: 58 },
  { label: "9 ago", value: 45 },
  { label: "13 ago", value: 72 },
  { label: "17 ago", value: 65 },
  { label: "21 ago", value: 38 },
  { label: "25 ago", value: 51 },
  { label: "29 ago", value: 83 },
];

const dual = series.map((d, i) => ({
  label: d.label,
  primary: d.value,
  secondary: Math.round(d.value * 0.55 + i * 3),
}));

const cats = [
  { label: "Instagram", value: 4200 },
  { label: "YouTube", value: 2800 },
  { label: "WhatsApp", value: 1900 },
  { label: "Email", value: 1100 },
  { label: "Directo", value: 640 },
];

const stacked = [
  { month: "Abr", cursos: 12000, mentoria: 8000, upsell: 3000 },
  { month: "May", cursos: 15000, mentoria: 9500, upsell: 4200 },
  { month: "Jun", cursos: 11000, mentoria: 12000, upsell: 3800 },
  { month: "Jul", cursos: 18000, mentoria: 10500, upsell: 5100 },
  { month: "Ago", cursos: 21000, mentoria: 13000, upsell: 6200 },
];

const slices = [
  { label: "Educativo", value: 42 },
  { label: "Venta", value: 28 },
  { label: "Autoridad", value: 18 },
  { label: "Comunidad", value: 9 },
  { label: "Otros", value: 5 },
];

const stages = [
  { label: "Impresiones", value: 120000 },
  { label: "Visitas", value: 24000 },
  { label: "Leads", value: 4800 },
  { label: "Llamadas", value: 960 },
  { label: "Ventas", value: 210 },
];

const radarMetrics = [
  { key: "alcance", label: "Alcance" },
  { key: "engagement", label: "Engagement" },
  { key: "conversion", label: "Conversión" },
  { key: "retencion", label: "Retención" },
  { key: "frecuencia", label: "Frecuencia" },
];

const radarSeries = [
  {
    label: "Este mes",
    values: { alcance: 78, engagement: 62, conversion: 45, retencion: 88, frecuencia: 55 },
  },
  {
    label: "Mes anterior",
    values: { alcance: 61, engagement: 71, conversion: 38, retencion: 72, frecuencia: 70 },
  },
];

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function ChartsGallery() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 p-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Sistema de gráficos</h1>
        <p className="max-w-2xl text-caption text-muted-foreground">
          Todos los componentes de <code>components/charts/platform</code> con
          datos de ejemplo. Sirve para revisar color, leyendas, espaciados y
          recortes en los dos temas antes de tocar un módulo real.
        </p>
      </header>

      <Row title="Series temporales">
        <div className="grid gap-4 md:grid-cols-2">
          <ChartShell title="TrendLineChart" subtitle="Leads por día">
            <TrendLineChart data={series} />
          </ChartShell>
          <ChartShell title="HeroAreaChart" subtitle="Alcance">
            <HeroAreaChart data={series} />
          </ChartShell>
          <ChartShell title="DualAreaChart" subtitle="Dos series superpuestas">
            <DualAreaChart
              data={dual}
              primaryKey="leads"
              secondaryKey="ventas"
              primaryLabel="Leads"
              secondaryLabel="Ventas"
            />
          </ChartShell>
          <ChartShell title="InteractiveDualAreaChart" subtitle="Dos series">
            <InteractiveDualAreaChart
              data={dual}
              primaryKey="leads"
              secondaryKey="ventas"
              primaryLabel="Leads"
              secondaryLabel="Ventas"
            />
          </ChartShell>
        </div>
      </Row>

      <Row title="Categorías">
        <div className="grid gap-4 md:grid-cols-2">
          <ChartShell title="CategoryBarChart (vertical)">
            <CategoryBarChart items={cats} />
          </ChartShell>
          <ChartShell title="CategoryBarChart (horizontal)">
            <CategoryBarChart items={cats} horizontal />
          </ChartShell>
          <ChartShell title="StackedBarChart" subtitle="Facturación por producto">
            <StackedBarChart
              data={stacked}
              keys={["cursos", "mentoria", "upsell"]}
              labels={["Cursos", "Mentoría", "Upsell"]}
            />
          </ChartShell>
          <ChartShell title="StackedBarChart 5 series">
            <StackedBarChart
              data={stacked.map((d) => ({ ...d, ads: 2000, afiliados: 1500 }))}
              keys={["cursos", "mentoria", "upsell", "ads", "afiliados"]}
              labels={["Cursos", "Mentoría", "Upsell", "Ads", "Afiliados"]}
            />
          </ChartShell>
        </div>
      </Row>

      <Row title="Distribución">
        <div className="grid gap-4 md:grid-cols-3">
          <ChartShell title="PieDistributionChart">
            <PieDistributionChart slices={slices} />
          </ChartShell>
          <ChartShell title="RingDistributionChart">
            <RingDistributionChart slices={slices} centerValue="102" centerLabel="Piezas" />
          </ChartShell>
          <ChartShell title="RadarPerformanceChart">
            <RadarPerformanceChart metrics={radarMetrics} series={radarSeries} />
          </ChartShell>
        </div>
      </Row>

      <Row title="Gauges y funnel">
        <div className="grid gap-4 md:grid-cols-3">
          <ChartShell title="GaugeMetricChart">
            <GaugeMetricChart value={68} label="Ocupación" />
          </ChartShell>
          <ChartShell title="GaugeTargetChart (default)">
            <GaugeTargetChart value={72} target={80} label="Show rate" />
          </ChartShell>
          <ChartShell title="GaugeTargetChart (margin)">
            <GaugeTargetChart value={41} target={50} label="Margen" variant="margin" />
          </ChartShell>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <ChartShell title="FunnelChartPanel (vertical)">
            <FunnelChartPanel stages={stages} />
          </ChartShell>
          <ChartShell title="FunnelChartPanel (horizontal)">
            <FunnelChartPanel stages={stages} orientation="horizontal" />
          </ChartShell>
        </div>
      </Row>

      <Row title="Paneles con métrica">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricChartPanel title="Ingresos" value="$128.400" subtitle="Últimos 30 días">
            <HeroAreaChart data={series} />
          </MetricChartPanel>
          <MiniMetricChart title="Leads" value="4.812">
            <SparklineChart data={series.map((s) => s.value)} />
          </MiniMetricChart>
          <MiniMetricChart title="Cierres" value="210">
            <SparklineChart data={series.map((s) => s.value).reverse()} />
          </MiniMetricChart>
        </div>
      </Row>
    </div>
  );
}
