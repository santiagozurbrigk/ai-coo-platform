"use client";

import Link from "next/link";
import { Button } from "@ai-coo/ui";
import { paths } from "@/routes";
import type { Sop } from "@/types/sops";
import { SopStatusBadge } from "./sop-status-badge";
import { SopDepartmentBadge } from "./sop-department-badge";

export function SopCard({ sop }: { sop: Sop }) {
  return (
    <div className="relative flex h-[150px] flex-col gap-2.5 overflow-hidden rounded-xl border border-border/40 bg-muted/30 p-4 transition-colors hover:border-border/70 dark:border-white/[0.08] dark:bg-[#1A1A1A]">
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-[13px] font-medium leading-snug text-foreground">
          {sop.title}
        </h3>
        <SopStatusBadge status={sop.status} />
      </div>

      <SopDepartmentBadge department={sop.department} />

      <p className="line-clamp-2 flex-1 text-[11px] leading-relaxed text-muted-foreground">
        {sop.goal}
      </p>

      <div className="mt-auto flex items-center justify-between gap-2">
        <span className="text-[11px] text-muted-foreground">
          Actualizado {sop.lastUpdated}
        </span>
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
  );
}
