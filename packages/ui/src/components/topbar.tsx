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
        "shell-topbar topbar flex h-14 shrink-0 items-center justify-between gap-4 rounded-none border-b border-border bg-transparent px-6",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        {breadcrumbs}
        {(title || subtitle) && (
          <div className="min-w-0">
            {title && (
              <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">
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
          <Separator
            orientation="vertical"
            className="hidden h-6 sm:block bg-border"
          />
          <div className="topbar-actions flex items-center gap-2">{actions}</div>
        </>
      )}
    </header>
  );
}
