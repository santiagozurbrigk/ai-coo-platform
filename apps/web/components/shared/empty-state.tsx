import type { ReactNode } from "react";
import { cn, Text } from "@ai-coo/ui";

export type EmptyStateVariant = "full" | "inline";

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  variant = "full",
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  variant?: EmptyStateVariant;
}) {
  if (variant === "inline") {
    return (
      <div
        className={cn(
          "empty-state glass-liquid-subtle rounded-xl border border-white/6 px-5 py-6 dark:border-white/6",
          className
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          {icon ? (
            <div className="glass-liquid-border flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground">
              <span className="relative z-10">{icon}</span>
            </div>
          ) : null}
          <div className="min-w-0 flex-1 text-left">
            <p className="text-sm font-medium">{title}</p>
            {description ? (
              <Text muted className="mt-1 leading-relaxed">
                {description}
              </Text>
            ) : null}
            {action ? <div className="mt-3">{action}</div> : null}
          </div>
        </div>
      </div>
    );
  }

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
      {description ? (
        <Text muted className="mt-1 max-w-sm">
          {description}
        </Text>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
