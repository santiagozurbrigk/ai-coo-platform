import { cn } from "@ai-coo/ui";
import type { InputImportance } from "@/types/operations";

const CONFIG: Record<
  InputImportance,
  { label: string; emoji: string; className: string }
> = {
  high: {
    label: "Muy importante",
    emoji: "🔴",
    className: "bg-red-500/15 text-red-300 border-red-500/30",
  },
  medium: {
    label: "Poco importante",
    emoji: "🟡",
    className: "bg-amber-500/15 text-amber-200 border-amber-500/30",
  },
  low: {
    label: "Solo para tenerlo en cuenta",
    emoji: "⚪",
    className: "bg-zinc-500/15 text-zinc-300 border-zinc-500/40",
  },
};

export function ImportanceBadge({ importance }: { importance: InputImportance }) {
  const c = CONFIG[importance];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-2xs font-medium",
        c.className
      )}
    >
      <span>{c.emoji}</span>
      {c.label}
    </span>
  );
}
