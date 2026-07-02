"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  DollarSign,
  MessageCircle,
  Youtube,
} from "lucide-react";
import { NotchedCard, Skeleton, SteppedAlert, cn } from "@ai-coo/ui";
import { getLeadJourneyAction } from "@/app/sales/actions";
import { paths } from "@/routes";
import type { LeadJourneyStep } from "@/lib/sales/lead-journey";

const STEP_ICON: Record<
  LeadJourneyStep["type"],
  { icon: typeof Youtube; className: string }
> = {
  content: { icon: Youtube, className: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/25" },
  dm: {
    icon: MessageCircle,
    className: "text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/25",
  },
  booking: {
    icon: Calendar,
    className: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/25",
  },
  sale: {
    icon: DollarSign,
    className: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  },
};

function formatStepDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function JourneySkeleton() {
  return (
    <div className="space-y-4 px-4 pb-4">
      {[0, 1, 2].map((index) => (
        <div key={index} className="flex gap-3">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-full max-w-xs" />
          </div>
        </div>
      ))}
    </div>
  );
}

function StepContent({ step }: { step: LeadJourneyStep }) {
  const config = STEP_ICON[step.type];
  const Icon = config.icon;
  const url =
    typeof step.metadata?.url === "string" ? step.metadata.url : undefined;
  const clientId =
    typeof step.metadata?.clientId === "string"
      ? step.metadata.clientId
      : undefined;
  const closingCallId =
    typeof step.metadata?.closingCallId === "string"
      ? step.metadata.closingCallId
      : undefined;

  const body = (
    <div className="min-w-0 flex-1 space-y-1">
      <p className="text-xs font-medium text-foreground">{step.title}</p>
      <p className="text-xs italic text-muted-foreground line-clamp-2">
        {step.description}
      </p>
      {step.date ? (
        <p className="text-[10px] text-muted-foreground/80">
          {formatStepDate(step.date)}
        </p>
      ) : null}
    </div>
  );

  const wrapperClass =
    "flex gap-3 rounded-lg border border-transparent px-1 py-1 transition-colors";

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(wrapperClass, "hover:border-border/60 hover:bg-muted/20")}
      >
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
            config.className
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        {body}
      </a>
    );
  }

  if (clientId) {
    return (
      <Link
        href={paths.platform.clients.detail(clientId)}
        className={cn(wrapperClass, "hover:border-border/60 hover:bg-muted/20")}
      >
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
            config.className
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        {body}
      </Link>
    );
  }

  if (closingCallId) {
    return (
      <Link
        href={paths.platform.sales.closing}
        className={cn(wrapperClass, "hover:border-border/60 hover:bg-muted/20")}
      >
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
            config.className
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        {body}
      </Link>
    );
  }

  return (
    <div className={wrapperClass}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
          config.className
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      {body}
    </div>
  );
}

export function LeadJourneyInline({
  conversationId,
  leadName,
}: {
  conversationId: string;
  leadName?: string;
}) {
  const [steps, setSteps] = useState<LeadJourneyStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getLeadJourneyAction(conversationId)
      .then((result) => {
        if (!cancelled) setSteps(result);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  return (
    <NotchedCard
      tab={leadName ? `Recorrido: ${leadName}` : "Recorrido del lead"}
      className="shrink-0 rounded-none border-x-0 border-b-0 shadow-none"
    >
      {loading ? (
        <JourneySkeleton />
      ) : steps.length === 0 ? (
        <SteppedAlert variant="info" title="Sin recorrido registrado">
          <p>
            Conectá UTMs en tus videos de YouTube para trackear de dónde vienen tus
            leads.
          </p>
        </SteppedAlert>
      ) : (
        <ol className="relative space-y-0">
          {steps.map((step, index) => (
            <li key={`${step.type}-${step.date}-${index}`} className="relative pl-0">
              {index < steps.length - 1 ? (
                <span
                  aria-hidden
                  className="absolute left-[15px] top-9 bottom-0 w-px bg-border/60"
                />
              ) : null}
              <StepContent step={step} />
            </li>
          ))}
        </ol>
      )}
    </NotchedCard>
  );
}
