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
      <p className="text-xs font-medium text-muted-foreground mb-3">
        Qué hacer ahora
      </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "group flex items-center gap-3 rounded-md border border-border/60 bg-muted/20 px-3 py-2.5",
              "transition-colors hover:border-primary/30 hover:bg-muted/40"
            )}
          >
            <Icon className="h-4 w-4 shrink-0 text-ai opacity-80 group-hover:opacity-100" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{label}</p>
              <p className="text-2xs text-muted-foreground">{description}</p>
            </div>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </GlassPanel>
  );
}
