"use client";

import { useEffect, useState } from "react";
import { getFrequentObjectionsAction } from "@/app/sales/actions";
import { FrequentObjectionsPanel } from "@/components/sales/frequent-objections-panel";
import type { FrequentObjectionsResult } from "@/types/sales";

export function FrequentObjectionsSection({
  initialData,
}: {
  initialData?: FrequentObjectionsResult;
}) {
  const [data, setData] = useState<FrequentObjectionsResult | null>(
    initialData ?? null
  );
  const [loading, setLoading] = useState(!initialData);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (initialData) return;

    let cancelled = false;
    getFrequentObjectionsAction()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((error) => {
        console.error("[FrequentObjectionsSection]", error);
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initialData]);

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">
        Cargando objeciones frecuentes…
      </p>
    );
  }

  if (loadError) {
    return (
      <FrequentObjectionsPanel
        objections={[]}
        dataSource="empty"
        loadError
      />
    );
  }

  if (!data) return null;

  return (
    <FrequentObjectionsPanel
      objections={data.objections}
      dataSource={data.dataSource}
    />
  );
}
