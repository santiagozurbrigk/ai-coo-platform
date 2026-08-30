import Link from "next/link";
import { Badge, cn } from "@ai-coo/ui";
import { LaunchStatusBadge } from "@/components/lanzamientos/launch-status-badge";
import {
  formatLaunchDate,
  formatLaunchMoney,
  goalProgressPct,
} from "@/lib/launches/format";
import { paths } from "@/routes";
import type { LaunchSummary } from "@/types/launches";

export function LaunchCard({ launch }: { launch: LaunchSummary }) {
  const revenuePct = goalProgressPct(launch.actualRevenue, launch.goalRevenue);
  const clientsPct = goalProgressPct(launch.actualClients, launch.goalClients);

  return (
    <Link
      href={paths.platform.lanzamientosDetail(launch.id)}
      className="group block rounded-xl border border-border/60 bg-card/40 p-5 transition-all hover:border-brand-500/30 hover:bg-card/60 dark:border-white/[0.08]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold group-hover:text-brand-600 dark:group-hover:text-brand-300">
            {launch.name}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatLaunchDate(launch.launchDate)}
          </p>
        </div>
        <LaunchStatusBadge status={launch.status} />
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Revenue</span>
            <span className="tabular-nums">
              {formatLaunchMoney(launch.actualRevenue)}
              {launch.goalRevenue
                ? ` / ${formatLaunchMoney(launch.goalRevenue)}`
                : ""}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted/40">
            <div
              className="h-full rounded-full bg-brand-500 transition-all"
              style={{ width: `${revenuePct ?? (launch.actualRevenue > 0 ? 100 : 0)}%` }}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {launch.actualClients} clientes
          {launch.goalClients ? ` / ${launch.goalClients} objetivo` : ""}
          {clientsPct != null ? ` (${clientsPct}%)` : ""}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-[10px]">
            {launch.taskCount} tareas
          </Badge>
          {launch.hasPostMortem ? (
            <Badge
              variant="outline"
              className="border-emerald-500/30 text-[10px] text-emerald-400"
            >
              Post-mortem ✓
            </Badge>
          ) : null}
          {launch.product ? (
            <span className={cn("text-[10px] text-muted-foreground")}>
              {launch.product.name}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
