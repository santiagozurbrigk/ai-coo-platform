"use client";

import { cn } from "@ai-coo/ui";
import type { WorkboardMember } from "@/types/workboard";

export function TaskAssigneeField({
  members,
  value,
  onChange,
  id,
}: {
  members: WorkboardMember[];
  value: string[];
  onChange: (ids: string[]) => void;
  id?: string;
}) {
  function toggle(memberId: string) {
    if (value.includes(memberId)) {
      onChange(value.filter((id) => id !== memberId));
      return;
    }
    onChange([...value, memberId]);
  }

  if (members.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        No hay miembros en el equipo para asignar.
      </p>
    );
  }

  return (
    <div
      id={id}
      className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-border bg-background p-2"
    >
      {members.map((member) => {
        const checked = value.includes(member.id);
        return (
          <label
            key={member.id}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted/60",
              checked && "bg-violet-500/10"
            )}
          >
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-border accent-violet-600"
              checked={checked}
              onChange={() => toggle(member.id)}
            />
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/15 text-[10px] font-medium text-violet-700 dark:text-violet-300">
              {member.initials}
            </span>
            <span className="min-w-0 truncate">{member.name}</span>
          </label>
        );
      })}
    </div>
  );
}

export function TaskAssigneeAvatars({
  assignees,
  max = 3,
  className,
}: {
  assignees: Array<{ id: string; name: string; initials: string }>;
  max?: number;
  className?: string;
}) {
  if (assignees.length === 0) return null;

  const visible = assignees.slice(0, max);
  const overflow = assignees.length - visible.length;

  return (
    <div className={cn("flex items-center -space-x-1.5", className)}>
      {visible.map((assignee) => (
        <span
          key={assignee.id}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-background bg-muted text-[10px] font-medium text-foreground"
          title={assignee.name}
        >
          {assignee.initials}
        </span>
      ))}
      {overflow > 0 ? (
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full border border-background bg-muted text-[9px] font-medium text-muted-foreground"
          title={assignees
            .slice(max)
            .map((assignee) => assignee.name)
            .join(", ")}
        >
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}
