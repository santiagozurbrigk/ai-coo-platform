import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@ai-coo/ui";

export interface MarketingEmptySectionProps {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  icon?: LucideIcon;
}

export function MarketingEmptySection({
  title,
  description,
  ctaLabel,
  ctaHref,
  icon: Icon,
}: MarketingEmptySectionProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/15 px-5 py-6 dark:border-white/[0.08]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {Icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
          {ctaLabel && ctaHref ? (
            <Button size="sm" variant="outline" className="mt-1" asChild>
              <Link href={ctaHref}>{ctaLabel}</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
