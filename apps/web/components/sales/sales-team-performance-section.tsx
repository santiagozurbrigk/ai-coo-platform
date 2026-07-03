"use client";

import { useEffect, useState } from "react";
import { getTeamRankingAction } from "@/app/sales/actions";
import {
  TeamCallRanking,
  TeamPerformanceSummary,
} from "@/components/sales/team-call-ranking";
import { EmptyState } from "@/components/shared/empty-state";
import type { TeamRankingEntry } from "@/types/call-analysis";

export function SalesTeamPerformanceSection() {
  const [ranking, setRanking] = useState<TeamRankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getTeamRankingAction()
      .then((data) => {
        if (!cancelled) setRanking(data);
      })
      .catch((error) => {
        console.error("[SalesTeamPerformanceSection]", error);
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">
        Cargando rendimiento del equipo…
      </p>
    );
  }

  if (loadError) {
    return (
      <EmptyState
        variant="inline"
        title="No pudimos cargar el rendimiento del equipo"
        description="Intentá de nuevo en unos segundos."
      />
    );
  }

  if (ranking.length === 0) {
    return (
      <EmptyState
        variant="inline"
        title="Todavía no hay análisis de calls"
        description="Conectá Fathom y procesá llamadas para ver el ranking y la evolución del equipo."
      />
    );
  }

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">
        Rendimiento del equipo de ventas
      </h3>
      <TeamCallRanking entries={ranking} />
      <TeamPerformanceSummary entries={ranking} />
    </section>
  );
}
