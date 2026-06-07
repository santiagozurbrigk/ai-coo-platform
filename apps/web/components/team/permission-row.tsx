"use client";

import { cn } from "@/lib/utils";
import type { PermissionLevel } from "@/types/team";

const PERMISSION_OPTIONS: {
  key: PermissionLevel;
  activeClass: string;
}[] = [
  { key: "none", activeClass: "bg-violet-600 border-violet-600" },
  { key: "view", activeClass: "bg-emerald-700 border-emerald-700" },
  { key: "full", activeClass: "bg-blue-600 border-blue-600" },
];

export interface PermissionRowProps {
  label: string;
  value: PermissionLevel;
  onChange: (value: PermissionLevel) => void;
}

export function PermissionRow({ label, value, onChange }: PermissionRowProps) {
  return (
    <div className="grid grid-cols-[1fr_110px_110px_110px] items-center rounded-lg px-3 py-2 transition-colors hover:bg-muted/40">
      <span className="text-[13px] text-foreground">{label}</span>
      {PERMISSION_OPTIONS.map(({ key, activeClass }) => (
        <div key={key} className="flex items-center justify-center">
          <button
            type="button"
            onClick={() => onChange(key)}
            aria-label={`${label}: ${key}`}
            aria-pressed={value === key}
            className={cn(
              "flex h-[18px] w-[18px] items-center justify-center rounded-full border-[1.5px] transition-all",
              value === key
                ? activeClass
                : "border-border/60 hover:border-border"
            )}
          >
            {value === key && (
              <div className="h-[6px] w-[6px] rounded-full bg-white" />
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
