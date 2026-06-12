"use client";

import type { ReactNode } from "react";
import { Button } from "@ai-coo/ui";
import {
  IntegrationStatusBadge,
  type IntegrationCardStatus,
} from "./integration-status-badge";

export type IntegrationCardShellProps = {
  name: string;
  description: string;
  icon: ReactNode;
  status: IntegrationCardStatus;
  lastSync?: string;
  actionLabel?: string;
  actionDisabled?: boolean;
  onConnect?: () => void;
  onManage?: () => void;
};

export function IntegrationCardShell({
  name,
  description,
  icon,
  status,
  lastSync,
  actionLabel,
  actionDisabled,
  onConnect,
  onManage,
}: IntegrationCardShellProps) {
  const isConnected = status === "connected";
  const isSyncing = status === "syncing";

  return (
    <div className="relative flex h-[130px] flex-col gap-2.5 overflow-hidden rounded-xl border border-border/40 bg-muted/30 p-4 transition-colors hover:border-border/70 dark:border-glass dark:bg-glass dark:backdrop-blur-md hover:dark:border-glass-strong hover:dark:bg-glass-hover transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/40 bg-background">
            {icon}
          </div>
          <span className="truncate text-[13px] font-medium text-foreground">
            {name}
          </span>
        </div>
        <IntegrationStatusBadge
          status={isSyncing ? "syncing" : status}
        />
      </div>

      <p className="line-clamp-2 flex-1 text-[11px] leading-relaxed text-muted-foreground">
        {description}
      </p>

      <div className="mt-auto flex items-center justify-between gap-2">
        <span className="truncate text-[11px] text-muted-foreground">
          {lastSync ? `Sync: ${lastSync}` : ""}
        </span>
        {isConnected ? (
          <Button
            variant="outline"
            size="sm"
            className="h-7 shrink-0 px-3 text-[11px]"
            disabled={actionDisabled}
            onClick={onManage}
          >
            {actionLabel ?? "Gestionar"}
          </Button>
        ) : (
          <Button
            size="sm"
            className="h-7 shrink-0 bg-violet-600 px-3 text-[11px] text-white hover:bg-violet-700"
            disabled={actionDisabled || isSyncing}
            onClick={onConnect}
          >
            {actionLabel ?? "Conectar"}
          </Button>
        )}
      </div>
    </div>
  );
}
