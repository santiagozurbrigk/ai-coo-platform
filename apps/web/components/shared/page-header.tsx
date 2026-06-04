import type { ReactNode } from "react";
import { cn, Text } from "@ai-coo/ui";

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  /** Omitir si el título ya aparece en el topbar (evita duplicado). */
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  if (!title && !description && !actions) return null;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      {(title || description) && (
        <div className="space-y-1">
          {title ? (
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          ) : null}
          {description ? <Text muted>{description}</Text> : null}
        </div>
      )}
      {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
    </div>
  );
}
