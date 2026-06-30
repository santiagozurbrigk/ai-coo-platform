import { DAY_LABELS_ES } from "@/lib/format";
import type { ClosingCall } from "@/types/closing";
import type { Conversation, SalesMetricsData } from "@/types/sales";
import type { CloserPerformance } from "@/types/finance";
import { deriveCloserBreakdown } from "@/lib/metrics/derive-finance-summary";

function isBooked(conv: Conversation): boolean {
  return (
    conv.status === "booked" ||
    conv.tag === "agendado" ||
    conv.tag === "closeado"
  );
}

function totalMessages(conversations: Conversation[]): number {
  return conversations.reduce((sum, c) => sum + c.messages.length, 0);
}

/** Tendencia semanal simple a partir de conversaciones agendadas en los últimos 7 días. */
function deriveBookingTrend(conversations: Conversation[]): { label: string; value: number }[] {
  const now = new Date();
  const counts = DAY_LABELS_ES.map((_, dayIndex) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - dayIndex));
    const key = d.toISOString().slice(0, 10);
    return conversations.filter((c) => {
      if (!isBooked(c)) return false;
      return c.lastMessageAt.slice(0, 10) === key;
    }).length;
  });

  const max = Math.max(...counts, 1);
  return DAY_LABELS_ES.map((label, i) => ({
    label,
    value: Math.max(1, Math.round((counts[i]! / max) * 12)),
  }));
}

export function deriveSalesMetrics(
  conversations: Conversation[],
  closingCalls: ClosingCall[],
  closerFallback?: CloserPerformance[]
): SalesMetricsData {
  const total = conversations.length;
  const bookedCount = conversations.filter(isBooked).length;
  const ghostedCount = conversations.filter((c) => c.status === "ghosted").length;
  const activeCount = conversations.filter((c) => c.status === "active").length;
  const unanswered = conversations.filter((c) => c.unread && c.status === "active")
    .length;

  const avgResponseMin =
    total > 0
      ? Math.round(
          conversations.reduce(
            (sum, c) => sum + (c.analysis?.responseTimeMinutes ?? 0),
            0
          ) / total
        )
      : 0;

  const messages = totalMessages(conversations);
  const messagesPerBooking =
    bookedCount > 0 ? Math.round(messages / bookedCount) : 0;

  const closerBreakdown = deriveCloserBreakdown(closingCalls);
  const closers =
    closerBreakdown.length > 0
      ? closerBreakdown
      : (closerFallback ?? []);

  return {
    totalConversations: total,
    bookingRate: total > 0 ? (bookedCount / total) * 100 : 0,
    ghostingRate: total > 0 ? (ghostedCount / total) * 100 : 0,
    avgResponseMin,
    messagesPerBooking,
    activeConversations: activeCount,
    unansweredConversations: unanswered,
    bookingTrend: deriveBookingTrend(conversations),
    closerBreakdown: closers,
  };
}
