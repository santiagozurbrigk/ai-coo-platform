"use client";

import { useEffect, useState } from "react";
import {
  getTeamRankingAction,
} from "@/app/sales/actions";
import {
  TeamCallRanking,
  TeamPerformanceSummary,
} from "@/components/sales/team-call-ranking";
import type { TeamRankingEntry } from "@/types/call-analysis";

export function SalesTeamPerformanceSection() {
  const [ranking, setRanking] = useState<TeamRankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getTeamRankingAction()
      .then((data) => {
        if (!cancelled) setRanking(data);
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
