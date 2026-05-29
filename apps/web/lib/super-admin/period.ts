export type SuperAdminPeriod = "day" | "week" | "month" | "year";

export type DateRangeIso = {
  start: string;
  end: string;
};

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

export function resolveSuperAdminPeriod(
  period: SuperAdminPeriod,
  now: Date = new Date()
): DateRangeIso {
  const anchor = startOfDay(now);

  if (period === "day") {
    return {
      start: anchor.toISOString(),
      end: endOfDay(anchor).toISOString(),
    };
  }

  if (period === "week") {
    const day = anchor.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const start = new Date(anchor);
    start.setDate(anchor.getDate() + diff);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start: start.toISOString(), end: endOfDay(end).toISOString() };
  }

  if (period === "month") {
    const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    return { start: start.toISOString(), end: endOfDay(end).toISOString() };
  }

  const start = new Date(anchor.getFullYear(), 0, 1);
  const end = new Date(anchor.getFullYear(), 11, 31);
  return { start: start.toISOString(), end: endOfDay(end).toISOString() };
}

export function getCurrentMonthRange(): DateRangeIso {
  return resolveSuperAdminPeriod("month");
}

export function getPreviousMonthRange(): DateRangeIso {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 15);
  return resolveSuperAdminPeriod("month", prev);
}

/** Últimos N días inclusive (para gráfico diario). */
export function getLastNDaysRange(days: number): DateRangeIso {
  const end = endOfDay(new Date());
  const start = startOfDay(new Date());
  start.setDate(start.getDate() - (days - 1));
  return { start: start.toISOString(), end: end.toISOString() };
}
