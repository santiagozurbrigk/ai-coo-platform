import type { ReactNode } from "react";
import { cn, Text } from "@ai-coo/ui";

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 px-6 text-center",
        className
      )}
    >
      {icon && <div className="mb-3 text-muted-foreground">{icon}</div>}
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <Text muted className="mt-1 max-w-sm">
          {description}
        </Text>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
