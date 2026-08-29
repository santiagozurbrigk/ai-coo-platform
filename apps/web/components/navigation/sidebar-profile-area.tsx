"use client";

import { useEffect, useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
} from "@ai-coo/ui";
import {
  getProfileAreaDataAction,
  type ProfileAreaData,
} from "@/app/profile/actions";
import { getProfileInitials } from "@/lib/profile/initials";

function ProfileAvatar({
  avatarUrl,
  userName,
  size = 32,
}: {
  avatarUrl: string | null;
  userName: string;
  size?: number;
}) {
  const initials = getProfileInitials(userName);

  return (
    <div className="relative shrink-0">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- URL externa de auth/avatar
        <img
          src={avatarUrl}
          alt={userName}
          width={size}
          height={size}
          className="rounded-full object-cover ring-1 ring-black/10 dark:ring-white/10"
        />
      ) : (
        <div
          className={cn(
            "avatar-fallback flex items-center justify-center rounded-full",
            "border border-brand-500/30 bg-brand-600/20 text-xs font-semibold text-brand-600",
            "dark:text-brand-400"
          )}
          style={{ width: size, height: size }}
          aria-hidden
        >
          {initials}
        </div>
      )}
    </div>
  );
}

export function SidebarProfileArea({
  collapsed,
  onToggleCollapsed,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const [data, setData] = useState<ProfileAreaData | null>(null);

  useEffect(() => {
    getProfileAreaDataAction()
      .then(setData)
      .catch(() =>
        setData({
          avatarUrl: null,
          userName: "Usuario",
          orgName: "Mi organización",
        })
      );
  }, []);

  const userName = data?.userName ?? "…";
  const orgName = data?.orgName ?? "…";
  const avatarUrl = data?.avatarUrl ?? null;

  const collapseButton = (
    <button
      type="button"
      onClick={onToggleCollapsed}
      aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
      className={cn(
        "sidebar-item text-muted-foreground",
        collapsed && "sidebar-item-collapsed",
        !collapsed &&
          "shrink-0 rounded-md p-1 hover:bg-black/[0.05] hover:text-foreground dark:hover:bg-white/[0.05] dark:hover:text-white/60"
      )}
    >
      {collapsed ? (
        <PanelLeftOpen className="sidebar-item-icon h-3.5 w-3.5" />
      ) : (
        <PanelLeftClose className="h-3.5 w-3.5" />
      )}
    </button>
  );

  if (collapsed) {
    return (
      <div className="profile-area glass-liquid-subtle mb-2 flex flex-col items-center gap-1.5 py-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="sidebar-item-slot cursor-default">
              <ProfileAvatar avatarUrl={avatarUrl} userName={userName} size={28} />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-left">
            <p className="profile-area-user-name font-medium">{userName}</p>
            <p className="profile-area-org-name text-xs text-muted-foreground">
              {orgName}
            </p>
          </TooltipContent>
        </Tooltip>
        <div className="sidebar-item-slot">{collapseButton}</div>
      </div>
    );
  }

  return (
    <div className="profile-area glass-liquid-subtle mx-1 mb-2 flex items-center gap-3 rounded-xl px-3 py-3">
      <ProfileAvatar avatarUrl={avatarUrl} userName={userName} />
      <div className="min-w-0 flex-1">
        <p className="profile-area-user-name truncate text-xs font-semibold leading-tight text-foreground">
          {userName}
        </p>
        <p className="profile-area-org-name mt-0.5 truncate text-[11px] leading-tight text-muted-foreground">
          {orgName}
        </p>
      </div>
      {collapseButton}
    </div>
  );
}
