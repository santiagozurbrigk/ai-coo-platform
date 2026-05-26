import { Panel } from "@/components/shared/panel";

export function ContentFunnel({
  stages,
}: {
  stages: { stage: string; value: number; pct: number }[];
}) {
  const max = stages[0]?.value ?? 1;

  return (
    <Panel title="Embudo de influencia del contenido">
      <div className="space-y-4">
        {stages.map((s, i) => (
          <div key={s.stage} className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium">{s.stage}</span>
              <span className="text-muted-foreground tabular-nums">
                {s.value.toLocaleString("es")} · {s.pct}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-ai to-primary transition-all"
                style={{
                  width: `${(s.value / max) * 100}%`,
                  opacity: 1 - i * 0.15,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
