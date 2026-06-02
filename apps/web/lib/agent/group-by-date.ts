import type { AgentConversation } from "@/types/agent";

export type ConversationDateGroup = {
  label: string;
  conversations: AgentConversation[];
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function groupLabel(date: Date, now: Date): string {
  const day = startOfDay(date).getTime();
  const today = startOfDay(now).getTime();
  const diffDays = Math.floor((today - day) / 86_400_000);

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return "Esta semana";
  if (diffDays < 30) return "Este mes";
  return "Más antiguas";
}

export function groupConversationsByDate(
  conversations: AgentConversation[]
): ConversationDateGroup[] {
  const now = new Date();
  const sorted = [...conversations].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const map = new Map<string, AgentConversation[]>();
  for (const conv of sorted) {
    const label = groupLabel(new Date(conv.updatedAt), now);
    const list = map.get(label) ?? [];
    list.push(conv);
    map.set(label, list);
  }

  const order = ["Hoy", "Ayer", "Esta semana", "Este mes", "Más antiguas"];
  return order
    .filter((label) => map.has(label))
    .map((label) => ({ label, conversations: map.get(label)! }));
}
