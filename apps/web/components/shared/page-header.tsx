import type { ReactNode } from "react";
import { cn, Text } from "@ai-coo/ui";

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {description && <Text muted>{description}</Text>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}
