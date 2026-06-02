import { formatRelativeTime } from "@/lib/format";
import type { TeamInput } from "@/types/operations";
import { DepartmentBadge } from "./department-badge";
import { ImportanceBadge } from "./importance-badge";

export function TeamInputsList({ inputs }: { inputs: TeamInput[] }) {
  return (
    <ul className="space-y-3">
      {inputs.map((input) => (
        <li
          key={input.id}
          className="rounded-xl border border-border bg-card px-4 py-4"
        >
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <ImportanceBadge importance={input.importance} />
            <DepartmentBadge department={input.department} />
            <span className="text-2xs text-muted-foreground ml-auto">
              {formatRelativeTime(input.submittedAt)}
            </span>
          </div>
          <p className="text-sm">{input.preview}</p>
          <p className="mt-1 text-2xs text-muted-foreground">
            {input.author} · {input.type}
          </p>
        </li>
      ))}
    </ul>
  );
}
