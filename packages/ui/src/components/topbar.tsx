import * as React from "react";
import { cn } from "../lib/utils";
import { Separator } from "../primitives/separator";

export interface TopbarProps {
  title?: string;
  subtitle?: string;
  breadcrumbs?: React.ReactNode;
  actions?: React.ReactNode;
  search?: React.ReactNode;
  className?: string;
}

export function Topbar({
  title,
  subtitle,
  breadcrumbs,
  actions,
  search,
  className,
}: TopbarProps) {
  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-md",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        {breadcrumbs}
        {(title || subtitle) && (
          <div className="min-w-0">
            {title && (
              <h1 className="truncate text-sm font-semibold tracking-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}
      </div>
      {search && <div className="hidden max-w-sm flex-1 md:flex">{search}</div>}
      {actions && (
        <>
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          <div className="flex items-center gap-2">{actions}</div>
        </>
      )}
    </header>
  );
}
