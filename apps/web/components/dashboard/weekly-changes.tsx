import { Panel } from "@/components/shared";

export function WeeklyChanges({ changes }: { changes: string[] }) {
  return (
    <Panel title="Cambios de la semana">
      <ul className="space-y-2">
        {changes.map((change, i) => (
          <li
            key={i}
            className="flex gap-2 text-sm text-muted-foreground before:content-['•'] before:text-primary"
          >
            {change}
          </li>
        ))}
      </ul>
    </Panel>
  );
}
