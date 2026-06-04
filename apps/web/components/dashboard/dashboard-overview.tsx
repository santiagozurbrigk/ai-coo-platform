"use client";

import { motion } from "framer-motion";
import { AiCard } from "@ai-coo/ui";
import {
  CategoryBarChart,
  GaugeTargetChart,
  HeroAreaChart,
  InteractiveDualAreaChart,
  MetricChartPanel,
  MiniMetricChart,
  RingDistributionChart,
  TrendLineChart,
} from "@/components/charts/platform";
import type { PieData } from "@/components/charts/pie-context";
import { FlowCta } from "@/components/shared/flow-cta";
import { BentoCell, BentoCellPlace, BentoGrid } from "@/components/shared/bento-grid";
import { Panel } from "@/components/shared/panel";
import { formatMoney } from "@/lib/finance/format";
import { formatPercent } from "@/lib/format";
import { SPARKLINE_SERIES } from "@/lib/metrics/sparkline-series";
import { flowLinks } from "@/lib/navigation/flow-links";
import { paths } from "@/routes";
import type { DashboardData } from "@/types/dashboard";
import type { DashboardHeroMetrics } from "@/types/dashboard-hero";
import { ExecutiveSummary } from "./executive-summary";
import { RisksList } from "./risks-list";
import { OpportunitiesList } from "./opportunities-list";
import { WeeklyChanges } from "./weekly-changes";
import { NextActionsStrip } from "./next-actions-strip";

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

const BOOKING_TARGET = 70;

export function DashboardOverview({
  data,
  hero,
  dualTrend,
}: {
  data: DashboardData;
  hero: DashboardHeroMetrics;
  dualTrend: { label: string; primary: number; secondary: number }[];
}) {
  const convTrend = SPARKLINE_SERIES.conversations.map((v, i) => ({
    label: String(i + 1),
    value: v,
  }));

  const ghostGaugeValue = hero.ghostingRate;
  const responseGaugeValue = Math.min(100, (hero.avgResponseMin / 30) * 100);

  const clientsRing: PieData[] = [
    {
      label: "Activos",
      value: Math.max(hero.activeClients, 0),
      color: "var(--chart-3)",
    },
    {
      label: "Resto",
      value: hero.activeClients > 0 ? 1 : 0,
      color: "var(--chart-5)",
    },
  ].filter((s) => s.value > 0);

  return (
    <motion.div
      className="space-y-8"
      initial="initial"
      animate="animate"
      variants={{
        animate: { transition: { staggerChildren: 0.06 } },
      }}
    >
      <motion.div variants={fade}>
        <BentoGrid>
          <BentoCellPlace className="col-span-2 row-span-2 lg:col-span-2 lg:row-span-2">
            <MetricChartPanel
              title="Facturación"
              value={formatMoney(hero.facturacion)}
              subtitle="Últimos 7 días"
              className="min-h-[300px]"
            >
              <HeroAreaChart
                data={hero.facturacionTrend}
                color="var(--chart-2)"
                emptyMessage="Sin historial — solo valor del período"
              />
            </MetricChartPanel>
          </BentoCellPlace>

          <BentoCellPlace className="col-span-2 row-span-1 lg:col-span-2 lg:col-start-3 lg:row-start-1">
            <MetricChartPanel
              title="Cash Collected"
              value={formatMoney(hero.cashCollected)}
              subtitle="Últimos 7 días"
              className="min-h-[140px]"
            >
              <HeroAreaChart
                data={hero.cashTrend}
                color="var(--chart-2)"
                emptyMessage="Sin cobros en el período"
              />
            </MetricChartPanel>
          </BentoCellPlace>

          <BentoCellPlace className="col-span-2 row-span-1 lg:col-span-2 lg:col-start-3 lg:row-start-2">
            <MetricChartPanel
              title="Tasa de agendamiento"
              value={formatPercent(hero.bookingRate)}
              subtitle={`Objetivo ${BOOKING_TARGET}%`}
              className="min-h-[140px]"
            >
              <GaugeTargetChart
                value={hero.bookingRate}
                max={100}
                target={BOOKING_TARGET}
                label="Agendamiento"
                suffix="%"
                variant="booking"
                className="h-full"
              />
            </MetricChartPanel>
          </BentoCellPlace>

          <BentoCell size="unit">
            <MiniMetricChart title="Conv. activas" value={String(hero.activeConversations)}>
              <TrendLineChart
                data={convTrend}
                className="min-h-[120px]"
                aspectRatio="3 / 1"
              />
            </MiniMetricChart>
          </BentoCell>

          <BentoCell size="unit">
            <MiniMetricChart title="Tasa de fantasma" value={formatPercent(hero.ghostingRate)}>
              <GaugeTargetChart
                value={ghostGaugeValue}
                max={100}
                target={20}
                label="Fantasma"
                variant="inverted"
                className="min-h-[120px]"
              />
            </MiniMetricChart>
          </BentoCell>

          <BentoCell size="unit">
            <MiniMetricChart title="Tiempo de respuesta" value={`${hero.avgResponseMin} min`}>
              <CategoryBarChart
                items={SPARKLINE_SERIES.responseTime.map((v, i) => ({
                  label: `D${i + 1}`,
                  value: v,
                }))}
                className="min-h-[120px]"
              />
            </MiniMetricChart>
          </BentoCell>

          <BentoCell size="unit">
            <MiniMetricChart title="Clientes activos" value={String(hero.activeClients)}>
              <RingDistributionChart
                slices={clientsRing}
                centerValue={String(hero.activeClients)}
                centerLabel="Activos"
                className="max-w-[160px]"
              />
            </MiniMetricChart>
          </BentoCell>
        </BentoGrid>
      </motion.div>

      <motion.div variants={fade}>
        <Panel
          title="Ingresos cobrados — últimos 30 días"
          subtitle="Facturación vs Cash Collected · arrastra para seleccionar un rango"
          contentClassName="p-4"
        >
          <InteractiveDualAreaChart
            data={dualTrend}
            primaryKey="facturacion"
            secondaryKey="cashCollected"
            primaryLabel="Facturación"
            secondaryLabel="Cash collected"
            primaryColor="var(--chart-2)"
            secondaryColor="var(--chart-1)"
            emptyMessage="Aún no hay suficientes meses de datos"
          />
        </Panel>
      </motion.div>

      <motion.div variants={fade}>
        <AiCard title="Recomendación de IA" variant="recommendation" confidence={0.88}>
          {data.aiRecommendation}
        </AiCard>
        <div className="mt-1 flex flex-wrap gap-x-4">
          <FlowCta
            href={flowLinks.recommendation("rec1")}
            label="Actualizar SOP de onboarding"
          />
          <FlowCta
            href={`${paths.platform.intelligence.root}#bottlenecks`}
            label="Ver cuellos de botella"
            className="text-muted-foreground"
          />
        </div>
      </motion.div>

      <motion.div variants={fade}>
        <ExecutiveSummary summary={data.executiveSummary} />
      </motion.div>

      <motion.div variants={fade} className="grid gap-4 lg:grid-cols-2">
        <RisksList risks={data.risks} />
        <OpportunitiesList opportunities={data.opportunities} />
      </motion.div>

      <motion.div variants={fade}>
        <WeeklyChanges changes={data.weeklyChanges} />
      </motion.div>

      <motion.div variants={fade}>
        <NextActionsStrip />
      </motion.div>
    </motion.div>
  );
}
