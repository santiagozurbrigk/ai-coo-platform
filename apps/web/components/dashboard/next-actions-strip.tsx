"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Inbox, MessageSquare, Sparkles, TrendingUp } from "lucide-react";
import { GlassPanel, cn } from "@ai-coo/ui";
import { paths } from "@/routes";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { usePlatformData } from "@/providers/platform-data-provider";
import type { WeeklyReportRow } from "@/types/operations";

const useSupabase = isSupabaseConfigured();

const DEMO_ACTIONS: Array<{
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    href: paths.platform.sales.inbox,
    label: "Revisar bandeja",
    description: "12 sin responder",
    icon: Inbox,
  },
  {
    href: paths.platform.agent.root,
    label: "Agente de negocio",
    description: "Consultá con IA",
    icon: Sparkles,
  },
  {
    href: paths.platform.marketing.overview,
    label: "Marketing",
    description: "Ver rendimiento",
    icon: TrendingUp,
  },
  {
    href: paths.platform.sales.closing,
    label: "Llamadas de cierre",
    description: "Próximas sesiones",
    icon: MessageSquare,
  },
];

function buildActions(
  unanswered: number,
  weeklyReport: WeeklyReportRow | null | undefined
) {
  const actions: Array<{
    href: string;
    label: string;
    description: string;
    icon: LucideIcon;
  }> = [];

  if (unanswered > 0) {
    actions.push({
      href: paths.platform.sales.inbox,
      label: "Revisar bandeja",
      description: `${unanswered} sin responder`,
      icon: Inbox,
    });
  }

  actions.push({
    href: paths.platform.agent.root,
    label: "Agente de negocio",
    description: "Consultá con IA",
    icon: Sparkles,
  });

  actions.push({
    href: paths.platform.marketing.overview,
    label: "Marketing",
    description: "Ver rendimiento",
    icon: TrendingUp,
  });

  return actions;
}

export function NextActionsStrip({
  weeklyReport,
}: {
  weeklyReport?: WeeklyReportRow | null;
}) {
  const { salesMetrics } = usePlatformData();

  const actions = useSupabase
    ? buildActions(salesMetrics.unansweredConversations, weeklyReport)
    : DEMO_ACTIONS;

  if (actions.length === 0) return null;

  return (
    <GlassPanel className="p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70 mb-3">
        Qué hacer ahora
      </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map(({ href, label, description, icon: Icon }, i) => {
          const isUrgent = i === 0 && description.includes("sin responder");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg border px-3 py-2.5",
                "transition-all duration-150 hover:shadow-sm",
                isUrgent
                  ? "border-primary/30 bg-primary/5 hover:border-primary/50 hover:bg-primary/10"
                  : "border-border/60 bg-muted/20 hover:border-primary/30 hover:bg-muted/40"
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                  isUrgent ? "bg-primary/15" : "bg-muted/60"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", isUrgent ? "text-primary" : "text-ai opacity-80 group-hover:opacity-100")} />
                {isUrgent && (
                  <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-destructive" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{label}</p>
                <p className={cn("text-2xs", isUrgent ? "text-primary/80" : "text-muted-foreground")}>
                  {description}
                </p>
              </div>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-60 transition-opacity" />
            </Link>
          );
        })}
      </div>
    </GlassPanel>
  );
}
