"use client";

import { useMemo } from "react";
import { Badge, Button, cn, GlassPanel } from "@ai-coo/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CLOSING_CALL_STATUS_LABEL } from "@/lib/closing/call-status";
import {
  addMonths,
  addWeeks,
  dateKeyFromIso,
  formatCallTime,
  formatDayHeader,
  formatMonthTitle,
  formatWeekRangeTitle,
  getMonthGridDays,
  getWeekDays,
  isSameDay,
  isSameMonth,
  isToday,
  startOfWeek,
  toDateKey,
  WEEKDAY_LABELS,
} from "@/lib/closing/calendar";
import type { ClosingCall, ClosingCallStatus } from "@/types/closing";

const STATUS_LABEL = CLOSING_CALL_STATUS_LABEL;

const STATUS_DOT: Record<ClosingCallStatus, string> = {
  scheduled: "bg-primary",
  attended: "bg-sky-500",
  closed: "bg-emerald-500",
  not_closed: "bg-amber-500",
  no_show: "bg-destructive",
  cancelled: "bg-muted-foreground",
};

const STATUS_CHIP: Record<ClosingCallStatus, string> = {
  scheduled: "border-primary/30 bg-primary/10 hover:bg-primary/15",
  attended: "border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/15",
  closed: "border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15",
  not_closed: "border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15",
  no_show: "border-destructive/30 bg-destructive/10 hover:bg-destructive/15",
  cancelled: "border-border bg-muted/40 hover:bg-muted/60",
};

type ClosingCalendarProps = {
  calls: ClosingCall[];
  mode: "month" | "week";
  anchorDate: Date;
  onAnchorChange: (date: Date) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function ClosingCalendar({
  calls,
  mode,
  anchorDate,
  onAnchorChange,
  selectedId,
  onSelect,
}: ClosingCalendarProps) {
  const callsByDate = useMemo(() => {
    const map = new Map<string, ClosingCall[]>();
    for (const call of calls) {
      const key = dateKeyFromIso(call.scheduledAt);
      const list = map.get(key) ?? [];
      list.push(call);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      );
    }
    return map;
  }, [calls]);

  const weekStart = startOfWeek(anchorDate);
  const title =
    mode === "month"
      ? formatMonthTitle(anchorDate)
      : formatWeekRangeTitle(weekStart);

  const handlePrev = () => {
    onAnchorChange(
      mode === "month" ? addMonths(anchorDate, -1) : addWeeks(anchorDate, -1)
    );
  };

  const handleNext = () => {
    onAnchorChange(
      mode === "month" ? addMonths(anchorDate, 1) : addWeeks(anchorDate, 1)
    );
  };

  const handleToday = () => onAnchorChange(new Date());

  return (
    <GlassPanel className="overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={handlePrev}
            aria-label={mode === "month" ? "Mes anterior" : "Semana anterior"}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="min-w-[10rem] text-center text-sm font-semibold capitalize">
            {title}
          </h3>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={handleNext}
            aria-label={mode === "month" ? "Mes siguiente" : "Semana siguiente"}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={handleToday}>
          Hoy
        </Button>
      </div>

      {mode === "month" ? (
        <MonthView
          anchorDate={anchorDate}
          callsByDate={callsByDate}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ) : (
        <WeekView
          anchorDate={anchorDate}
          callsByDate={callsByDate}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      )}
    </GlassPanel>
  );
}

function MonthView({
  anchorDate,
  callsByDate,
  selectedId,
  onSelect,
}: {
  anchorDate: Date;
  callsByDate: Map<string, ClosingCall[]>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const days = getMonthGridDays(anchorDate);

  return (
    <div className="p-3 sm:p-4">
      <div className="grid grid-cols-7 gap-px rounded-lg overflow-hidden border border-border/50 bg-border/50">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="bg-muted/40 px-1 py-2 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs"
          >
            {label}
          </div>
        ))}
        {days.map((day) => (
          <MonthDayCell
            key={toDateKey(day)}
            day={day}
            anchorDate={anchorDate}
            calls={callsByDate.get(toDateKey(day)) ?? []}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

function MonthDayCell({
  day,
  anchorDate,
  calls,
  selectedId,
  onSelect,
}: {
  day: Date;
  anchorDate: Date;
  calls: ClosingCall[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const inMonth = isSameMonth(day, anchorDate);
  const today = isToday(day);
  const visible = calls.slice(0, 2);
  const overflow = calls.length - visible.length;

  return (
    <div
      className={cn(
        "min-h-[88px] bg-background/80 p-1.5 sm:min-h-[100px] sm:p-2",
        !inMonth && "bg-muted/20",
        today && "ring-1 ring-inset ring-primary/40"
      )}
    >
      <p
        className={cn(
          "mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
          !inMonth && "text-muted-foreground/60",
          today && "bg-primary text-primary-foreground",
          inMonth && !today && "text-foreground"
        )}
      >
        {day.getDate()}
      </p>
      <div className="space-y-0.5">
        {visible.map((call) => (
          <CalendarEventChip
            key={call.id}
            call={call}
            compact
            selected={selectedId === call.id}
            onSelect={onSelect}
          />
        ))}
        {overflow > 0 && (
          <p className="px-1 text-[10px] text-muted-foreground">+{overflow} más</p>
        )}
      </div>
    </div>
  );
}

function WeekView({
  anchorDate,
  callsByDate,
  selectedId,
  onSelect,
}: {
  anchorDate: Date;
  callsByDate: Map<string, ClosingCall[]>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const days = getWeekDays(anchorDate);

  return (
    <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-7 sm:gap-2 sm:p-4">
      {days.map((day) => {
        const key = toDateKey(day);
        const dayCalls = callsByDate.get(key) ?? [];
        const today = isToday(day);

        return (
          <div
            key={key}
            className={cn(
              "flex min-h-[120px] flex-col rounded-lg border border-border/60 bg-background/60",
              today && "border-primary/40 ring-1 ring-primary/20"
            )}
          >
            <div
              className={cn(
                "border-b border-border/50 px-2 py-2 text-center",
                today && "bg-primary/5"
              )}
            >
              <p className="text-[10px] font-medium uppercase text-muted-foreground">
                {WEEKDAY_LABELS[(day.getDay() + 6) % 7]}
              </p>
              <p className="text-sm font-semibold">{formatDayHeader(day)}</p>
            </div>
            <div className="flex flex-1 flex-col gap-1.5 p-2">
              {dayCalls.length === 0 ? (
                <p className="py-4 text-center text-[11px] text-muted-foreground">
                  Sin agendas
                </p>
              ) : (
                dayCalls.map((call) => (
                  <CalendarEventChip
                    key={call.id}
                    call={call}
                    selected={selectedId === call.id}
                    onSelect={onSelect}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CalendarEventChip({
  call,
  compact = false,
  selected,
  onSelect,
}: {
  call: ClosingCall;
  compact?: boolean;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(call.id)}
      className={cn(
        "w-full rounded-md border text-left transition-colors",
        STATUS_CHIP[call.status],
        compact ? "px-1 py-0.5" : "px-2 py-1.5",
        selected && "ring-2 ring-primary ring-offset-1 ring-offset-background"
      )}
    >
      <div className="flex items-center gap-1">
        <span
          className={cn("h-1.5 w-1.5 shrink-0 rounded-full", STATUS_DOT[call.status])}
          aria-hidden
        />
        <span className={cn("truncate font-medium", compact ? "text-[10px]" : "text-xs")}>
          {formatCallTime(call.scheduledAt)} · {call.leadName}
        </span>
      </div>
      {!compact && (
        <Badge variant="secondary" className="mt-1 h-5 text-[10px]">
          {STATUS_LABEL[call.status]}
        </Badge>
      )}
    </button>
  );
}
