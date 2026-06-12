import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import { paths } from "@/routes";
import type { FrequentObjection, ObjectionCategory } from "@/types/sales";

const CATEGORY_LABEL: Record<ObjectionCategory, string> = {
  closing: "Closing",
  setting: "Setting",
  marketing: "Marketing",
};

const CATEGORY_VARIANT: Record<
  ObjectionCategory,
  "default" | "secondary" | "warning"
> = {
  closing: "default",
  setting: "warning",
  marketing: "secondary",
};

export function FrequentObjectionsPanel({
  objections,
}: {
  objections: FrequentObjection[];
}) {
  if (objections.length === 0) return null;

  const sorted = [...objections].sort((a, b) => b.frequency - a.frequency);

  return (
    <Panel
      title="Objeciones frecuentes esta semana"
      subtitle="Detectadas en conversaciones y calls — mock"
    >
      <ul className="space-y-3">
        {sorted.map((objection, index) => (
          <li
            key={objection.id}
            className="flex flex-col gap-2 rounded-xl border border-border/60 px-4 py-3 dark:border-white/[0.08]"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold tabular-nums">
                  {index + 1}
                </span>
                <p className="text-sm font-medium">{objection.text}</p>
              </div>
              <Badge variant="outline" className="shrink-0 tabular-nums">
                {objection.frequency}×
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 pl-8">
              <Badge variant={CATEGORY_VARIANT[objection.category]}>
                {CATEGORY_LABEL[objection.category]}
              </Badge>
              <Link
                href={`${paths.platform.sales.inbox}?c=${objection.conversationId}`}
                className="inline-flex items-center gap-1 text-xs text-violet-400 transition-colors hover:text-violet-300"
              >
                {objection.leadName}
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
