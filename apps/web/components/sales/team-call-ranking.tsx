"use client";

import { cn } from "@ai-coo/ui";
import type { TeamRankingEntry } from "@/types/call-analysis";

const MEDALS = ["🥇", "🥈", "🥉"];

function trendIcon(trend: TeamRankingEntry["trend"]) {
  if (trend === "up") return <span className="text-emerald-600 dark:text-emerald-400">↑</span>;
  if (trend === "down") return <span className="text-red-600 dark:text-red-400">↓</span>;
  return <span className="text-muted-foreground">→</span>;
}

function buildInsight(entries: TeamRankingEntry[]): string | null {
  if (entries.length < 2) return null;

  const sorted = [...entries].sort((a, b) => a.score - b.score);
  const worst = sorted[0];
  const avg = Math.round(
    entries.reduce((sum, e) => sum + e.score, 0) / entries.length
  );
  const gap = avg - worst.score;
  if (gap <= 0) return null;

  const section =
    worst.score < 60 ? "objeciones" : worst.score < 70 ? "CTA y cierre" : "presentación";

  return `${worst.name} está ${gap} puntos por debajo del promedio. Su mayor gap es ${section} (${worst.score}/100). Recomendación: role-play semanal enfocado en ${section.toLowerCase()} y revisión de 2 llamadas grabadas.`;
}

export function TeamCallRanking({
  entries,
  className,
}: {
  entries: TeamRankingEntry[];
  className?: string;
}) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Todavía no hay análisis de calls para mostrar el ranking del equipo.
      </p>
    );
  }

  const minScore = Math.min(...entries.map((e) => e.score));
  const insight = buildInsight(entries);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="overflow-x-auto rounded-xl border border-border/60 dark:border-white/[0.08]">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-xs text-muted-foreground dark:border-white/[0.08]">
              <th className="px-4 py-3 font-medium">Pos</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Calls</th>
              <th className="px-4 py-3 font-medium">Bookings</th>
              <th className="px-4 py-3 font-medium">Conversión</th>
              <th className="px-4 py-3 font-medium">Tendencia</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr
                key={entry.name}
                className={cn(
                  "border-b border-border/40 last:border-0 dark:border-white/[0.06]",
                  entry.score === minScore && entries.length > 1 && "bg-red-500/5"
                )}
              >
                <td className="px-4 py-3 tabular-nums">
                  {index < 3 ? MEDALS[index] : index + 1}
                </td>
                <td className="px-4 py-3 font-medium">{entry.name}</td>
                <td className="px-4 py-3 tabular-nums">{entry.score}</td>
                <td className="px-4 py-3 tabular-nums">{entry.calls}</td>
                <td className="px-4 py-3 tabular-nums">{entry.bookings}</td>
                <td className="px-4 py-3 tabular-nums">{entry.conversion}</td>
                <td className="px-4 py-3">{trendIcon(entry.trend)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {insight ? (
        <div className="rounded-xl border border-amber-500/20 bg-amber-900/10 p-4 text-sm text-muted-foreground">
          {insight}
        </div>
      ) : null}
    </div>
  );
}

export function TeamPerformanceSummary({
  entries,
}: {
  entries: TeamRankingEntry[];
}) {
  if (entries.length === 0) return null;

  const avgScore = Math.round(
    entries.reduce((sum, e) => sum + e.score, 0) / Math.max(entries.length, 1)
  );
  const best = [...entries].sort((a, b) => b.score - a.score)[0];
  const worst = [...entries].sort((a, b) => a.score - b.score)[0];

  const cards = [
    { label: "Score promedio", value: `${avgScore}%` },
    {
      label: "Mejor closer",
      value: best ? `${best.name} (${best.score})` : "—",
    },
    {
      label: "Call con menor score",
      value: worst ? `${worst.name} (${worst.score})` : "—",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-border/60 bg-muted/10 p-4 dark:border-white/[0.08]"
        >
          <p className="text-xs text-muted-foreground">{card.label}</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
