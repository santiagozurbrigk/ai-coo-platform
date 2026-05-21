"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Circle, Play, Sparkles } from "lucide-react";
import { Badge, Button, Caption, GlassPanel, Text, cn } from "@ai-coo/ui";
import { es } from "@/lib/locale/es";
import {
  DEMO_MODULE_CHECKLIST,
  DEMO_TOUR_STEPS,
} from "@/lib/demo/tour-steps";
import { paths } from "@/routes";

const STORAGE_KEY = "ai-coo-demo-checked";

export function DemoTour() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setChecked(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCheck = (id: string) => {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const doneCount = DEMO_MODULE_CHECKLIST.filter((m) => checked[m.id]).length;
  const total = DEMO_MODULE_CHECKLIST.length;
  const progress = Math.round((doneCount / total) * 100);

  const groupedModules = DEMO_MODULE_CHECKLIST.reduce<
    Record<string, typeof DEMO_MODULE_CHECKLIST>
  >((acc, item) => {
    const list = acc[item.group] ?? [];
    list.push(item);
    acc[item.group] = list;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-4xl space-y-12 pb-16">
      <header className="space-y-4 text-center animate-fade-in">
        <Badge variant="ai" className="mx-auto">
          {es.demo.badge}
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-gradient-ai sm:text-4xl">
          {es.demo.title}
        </h1>
        <Text muted className="mx-auto max-w-2xl">
          {es.demo.subtitle}
        </Text>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button asChild size="lg" className="gap-2">
            <Link href={DEMO_TOUR_STEPS[0].href}>
              <Play className="h-4 w-4" />
              {es.demo.startTour}
            </Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href={paths.platform.dashboard}>{es.demo.enterPlatform}</Link>
          </Button>
        </div>
      </header>

      <GlassPanel className="p-6" glow>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">{es.demo.checklistProgress}</p>
            <p className="text-2xs text-muted-foreground mt-0.5">
              {doneCount} / {total} módulos revisados
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-ai transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-medium tabular-nums">{progress}%</span>
          </div>
        </div>
      </GlassPanel>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">
          {es.demo.recommendedPath}
        </h2>
        <p className="text-sm text-muted-foreground">{es.demo.pathHint}</p>
        <ol className="space-y-3">
          {DEMO_TOUR_STEPS.map((step) => (
            <li key={step.id}>
              <Link
                href={step.href}
                className={cn(
                  "group flex gap-4 rounded-lg border border-border/80 bg-card/40 p-4",
                  "transition-colors hover:border-primary/30 hover:bg-muted/30"
                )}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                  {step.order}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{step.title}</p>
                    <Caption className="normal-case">{step.duration}</Caption>
                    {step.highlight && (
                      <Badge variant="secondary" className="text-2xs">
                        {step.highlight}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold tracking-tight">
          {es.demo.fullChecklist}
        </h2>
        {Object.entries(groupedModules).map(([group, items]) => (
          <div key={group} className="space-y-2">
            <Caption className="normal-case text-muted-foreground">{group}</Caption>
            <ul className="space-y-1">
              {items.map((item) => {
                const isDone = !!checked[item.id];
                return (
                  <li
                    key={item.id}
                    className="flex items-center gap-2 rounded-md border border-transparent px-2 py-1.5 hover:border-border/60 hover:bg-muted/20"
                  >
                    <button
                      type="button"
                      onClick={() => toggleCheck(item.id)}
                      className="shrink-0 text-muted-foreground hover:text-foreground"
                      aria-label={isDone ? "Marcar pendiente" : "Marcar revisado"}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </button>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex-1 text-sm transition-colors hover:text-primary",
                        isDone && "text-muted-foreground line-through"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      <GlassPanel className="p-6 text-center">
        <Sparkles className="mx-auto h-6 w-6 text-ai mb-3" />
        <p className="text-sm font-medium">{es.demo.phaseComplete}</p>
        <Text muted className="mt-2 text-xs max-w-lg mx-auto">
          {es.demo.phaseCompleteDesc}
        </Text>
        <Button variant="outline" className="mt-4" asChild>
          <Link href={paths.home}>{es.demo.backHome}</Link>
        </Button>
      </GlassPanel>
    </div>
  );
}
