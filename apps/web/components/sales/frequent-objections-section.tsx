"use client";

import { useEffect, useState } from "react";
import { getFrequentObjectionsAction } from "@/app/sales/actions";
import { FrequentObjectionsPanel } from "@/components/sales/frequent-objections-panel";
import type { FrequentObjection } from "@/types/sales";

export function FrequentObjectionsSection() {
  const [objections, setObjections] = useState<FrequentObjection[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromCalls, setFromCalls] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getFrequentObjectionsAction()
      .then((result) => {
        if (cancelled) return;
        setObjections(result.objections);
        setFromCalls(result.fromCallAnalyses);
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
        Cargando objeciones frecuentes…
      </p>
    );
  }

  return (
    <FrequentObjectionsPanel
      objections={objections}
      dataSource={fromCalls ? "calls" : "fallback"}
    />
  );
}
