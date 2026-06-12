"use client";

import { Badge, cn } from "@ai-coo/ui";
import { LineChart, Line } from "@/components/charts/line-chart";
import { Grid } from "@/components/charts/grid";
import { XAxis } from "@/components/charts/x-axis";
import { ChartTooltip } from "@/components/charts/tooltip";
import { ChartWrapper, CHART_MIN_HEIGHT } from "@/components/charts/platform/chart-wrapper";

const WEEK_LABELS = Array.from({ length: 8 }, (_, i) => `Sem ${i + 1}`);

function buildChartRows(closerScores: number[], teamAverage: number[]) {
  const anchor = new Date();
  return closerScores.map((score, i) => {
    const date = new Date(anchor);
    date.setDate(date.getDate() - (closerScores.length - 1 - i) * 7);
    return {
      date,
      name: WEEK_LABELS[i],
      closer: score,
      teamAvg: teamAverage[i] ?? score,
    };
  });
}

export function CloserEvolutionChart({
  closerName,
  scores,
  teamAverage,
  className,
}: {
  closerName: string;
  scores: number[];
  teamAverage: number[];
  className?: string;
}) {
  const data = buildChartRows(scores, teamAverage);
  const delta = scores.length >= 2 ? scores[scores.length - 1] - scores[0] : 0;
  const trendUp = delta > 2;
  const trendStable = Math.abs(delta) <= 2;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium">Evolución de {closerName}</h3>
        {trendStable ? (
          <Badge variant="secondary">→ Estable</Badge>
        ) : trendUp ? (
          <Badge className="bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/30">
            ↑ +{delta} pts en 8 semanas
          </Badge>
        ) : (
          <Badge variant="destructive">↓ {delta} pts en 8 semanas</Badge>
        )}
      </div>

      <ChartWrapper
        data={data}
        minPoints={2}
        emptyMessage="Sin datos de evolución"
        className={cn("w-full", CHART_MIN_HEIGHT.md)}
        minHeight={CHART_MIN_HEIGHT.md}
      >
        <LineChart
          data={data}
          xDataKey="date"
          aspectRatio="2.2 / 1"
          className="w-full"
          animationDuration={800}
          margin={{ top: 20, right: 16, bottom: 36, left: 8 }}
        >
          <Grid horizontal vertical={false} numTicksRows={4} />
          <Line
            dataKey="teamAvg"
            stroke="var(--muted-foreground)"
            strokeWidth={1.5}
            showMarkers={false}
            showHighlight={false}
            dashFromIndex={0}
            dashArray="5,4"
          />
          <Line
            dataKey="closer"
            stroke="#a78bfa"
            strokeWidth={2.5}
            showMarkers
            showHighlight
          />
          <XAxis numTicks={8} />
          <ChartTooltip />
        </LineChart>
      </ChartWrapper>

      <div className="flex flex-wrap gap-4 text-2xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded bg-violet-400" />
          {closerName}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded border-b border-dashed border-muted-foreground" />
          Promedio equipo
        </span>
      </div>
    </div>
  );
}
