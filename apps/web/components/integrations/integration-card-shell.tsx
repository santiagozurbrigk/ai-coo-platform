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
  onDisconnect?: () => void;
  disconnectDisabled?: boolean;
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
  onDisconnect,
  disconnectDisabled,
}: IntegrationCardShellProps) {
  const isConnected = status === "connected";
  const isSyncing = status === "syncing";

  return (
    <div className="relative flex flex-col gap-3 overflow-hidden rounded-xl border border-border/40 bg-muted/30 p-4 transition-all duration-200 hover:border-border/70 dark:border-glass dark:bg-glass dark:backdrop-blur-md hover:dark:border-glass-strong hover:dark:bg-glass-hover">
      {/* Header: logo + nombre + badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          {icon}
          <span className="truncate text-[13px] font-semibold text-foreground">
            {name}
          </span>
        </div>
        <IntegrationStatusBadge status={isSyncing ? "syncing" : status} />
      </div>

      {/* Descripción */}
      <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
        {description}
      </p>

      {/* Footer: sync info + acciones */}
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[10px] text-muted-foreground/70">
          {lastSync ? `Sync: ${lastSync}` : ""}
        </span>
        {isConnected ? (
          <div className="flex shrink-0 items-center gap-1.5">
            {onDisconnect ? (
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="h-7 shrink-0 px-2.5 text-[11px] text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                disabled={disconnectDisabled}
                onClick={onDisconnect}
              >
                Desconectar
              </Button>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              className="h-7 shrink-0 px-3 text-[11px]"
              disabled={actionDisabled}
              onClick={onManage}
            >
              {actionLabel ?? "Gestionar"}
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            className="h-7 shrink-0 bg-brand-600 px-3 text-[11px] text-white hover:bg-brand-700"
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
