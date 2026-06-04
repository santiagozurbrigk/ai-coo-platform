import { cn } from "@ai-coo/ui";

export function MockPhaseBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full bg-violet-500/20 px-1.5 py-0.5 text-[9px] font-medium text-violet-600 dark:text-violet-400",
        className
      )}
    >
      Mock · Phase 2
    </span>
  );
}
