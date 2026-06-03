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
        "empty-state glass-liquid-subtle flex flex-col items-center justify-center rounded-2xl border border-white/6 py-12 px-6 text-center dark:border-white/6",
        className
      )}
    >
      {icon ? (
        <div className="glass-liquid-border mb-4 flex h-16 w-16 items-center justify-center rounded-full text-muted-foreground">
          <span className="relative z-10">{icon}</span>
        </div>
      ) : null}
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
