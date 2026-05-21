import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@ai-coo/ui";
import { paths } from "@/routes";
import type { Sop } from "@/types/sops";
import { SopStatusBadge } from "./sop-status-badge";
import { DepartmentBadge } from "@/components/operations/department-badge";
import type { Department } from "@/types/operations";

export function SopCard({ sop }: { sop: Sop }) {
  const dept = sop.department === "general" ? "operations" : sop.department;

  return (
    <Link href={paths.platform.sops.detail(sop.id)}>
      <Card className="h-full transition-colors hover:bg-muted/20">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-snug">{sop.title}</CardTitle>
            <SopStatusBadge status={sop.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <DepartmentBadge department={dept as Department} />
          <p className="text-xs text-muted-foreground line-clamp-2">{sop.goal}</p>
          <p className="text-2xs text-muted-foreground">Updated {sop.lastUpdated}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
