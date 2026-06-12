import { Clock, Target, Wrench } from "lucide-react";
import { Badge, cn } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import type { MemberTimeReport, TaskTimeKind } from "@/types/workboard";

const KIND_LABEL: Record<TaskTimeKind, string> = {
  strategic: "Estratégica",
  operational: "Operativa",
};

function MemberTimeCard({ report }: { report: MemberTimeReport }) {
  return (
    <Panel
      title={report.name}
      subtitle={`${report.totalHours} h esta semana`}
      contentClassName="space-y-4"
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: report.avatarColor }}
          aria-hidden
        >
          {report.initials}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <Target className="h-3.5 w-3.5" />
              Estratégico {report.strategicPercent}%
            </span>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Wrench className="h-3.5 w-3.5" />
              Operativo {report.operationalPercent}%
            </span>
          </div>
          <div className="flex h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="bg-emerald-500/80 transition-all"
              style={{ width: `${report.strategicPercent}%` }}
            />
            <div
              className="bg-muted-foreground/30"
              style={{ width: `${report.operationalPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          Top 3 tareas por tiempo
        </p>
        <ol className="space-y-2">
          {report.topTasks.map((task, index) => (
            <li
              key={task.taskId}
              className="flex items-start justify-between gap-3 rounded-lg border border-border/60 px-3 py-2.5 dark:border-white/[0.08]"
            >
              <div className="flex min-w-0 items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-2xs font-semibold tabular-nums">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-snug">{task.title}</p>
                  <Badge
                    variant={task.kind === "strategic" ? "default" : "secondary"}
                    className="mt-1 text-2xs"
                  >
                    {KIND_LABEL[task.kind]}
                  </Badge>
                </div>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-violet-300">
                {task.hours}h
              </span>
            </li>
          ))}
        </ol>
      </div>
    </Panel>
  );
}

export function WorkboardTimeReport({
  reports,
}: {
  reports: MemberTimeReport[];
}) {
  const totalHours = reports.reduce((sum, r) => sum + r.totalHours, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm dark:border-white/[0.08]">
        <Clock className="h-4 w-4 text-violet-400" />
        <span className="text-muted-foreground">Tiempo registrado esta semana:</span>
        <span className="font-semibold tabular-nums">{totalHours} h</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">
          {reports.length} miembros con actividad
        </span>
      </div>

      <div
        className={cn(
          "grid gap-4",
          "sm:grid-cols-2 xl:grid-cols-2"
        )}
      >
        {reports.map((report) => (
          <MemberTimeCard key={report.memberId} report={report} />
        ))}
      </div>
    </div>
  );
}
