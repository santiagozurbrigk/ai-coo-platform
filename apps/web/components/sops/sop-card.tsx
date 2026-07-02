"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Badge, Button } from "@ai-coo/ui";
import { paths } from "@/routes";
import type { Sop } from "@/types/sops";
import { SopStatusBadge } from "./sop-status-badge";
import { SopDepartmentBadge } from "./sop-department-badge";
import { SopVersionsSheet } from "./sop-versions-sheet";

function formatDuration(minutes?: number): string {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function SopCard({ sop }: { sop: Sop }) {
  const [versionsOpen, setVersionsOpen] = useState(false);
  const isMock = !/^[0-9a-f-]{36}$/i.test(sop.id);

  return (
    <div className="relative flex min-h-[170px] flex-col gap-2.5 overflow-hidden rounded-xl border border-border/40 bg-muted/30 p-4 transition-colors hover:border-border/70 dark:border-glass dark:bg-glass dark:backdrop-blur-md hover:dark:border-glass-strong hover:dark:bg-glass-hover transition-all duration-200">
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-[13px] font-medium leading-snug text-foreground">
          {sop.title}
        </h3>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <SopStatusBadge status={sop.status} />
          {sop.generatedByAI ? (
            <Badge
              variant="outline"
              className="gap-0.5 text-[9px] text-violet-700 dark:text-violet-300"
            >
              <Sparkles className="h-2.5 w-2.5" />
              IA
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <SopDepartmentBadge department={sop.department} />
        {sop.version ? (
          <Badge variant="outline" className="text-[9px] text-muted-foreground">
            v{sop.version}
          </Badge>
        ) : null}
        {sop.estimatedDurationMinutes ? (
          <Badge variant="outline" className="text-[9px] text-muted-foreground">
            {formatDuration(sop.estimatedDurationMinutes)}
          </Badge>
        ) : null}
      </div>

      {sop.tags && sop.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {sop.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-[9px]">
              {tag}
            </Badge>
          ))}
        </div>
      ) : null}

      <p className="line-clamp-2 flex-1 text-[11px] leading-relaxed text-muted-foreground">
        {sop.goal}
      </p>

      <div className="mt-auto flex items-center justify-between gap-2">
        <span className="text-[11px] text-muted-foreground">
          Actualizado {sop.lastUpdated}
        </span>
        <div className="flex items-center gap-1">
          {!isMock ? (
            <SopVersionsSheet
              sopId={sop.id}
              sopTitle={sop.title}
              open={versionsOpen}
              onOpenChange={setVersionsOpen}
            />
          ) : null}
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-7 shrink-0 px-3 text-[11px]"
          >
            <Link href={paths.platform.sops.detail(sop.id)}>Ver SOP</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
