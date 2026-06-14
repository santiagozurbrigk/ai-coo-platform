import { cn } from "@ai-coo/ui";

export function MockPhaseBadge({
  hasRealData,
  className,
}: {
  hasRealData?: boolean;
  className?: string;
}) {
  if (hasRealData) return null;

  return (
    <span
      className={cn(
        "inline-flex rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400",
        className
      )}
    >
      Sin datos configurados — agregá tu primer avatar o producto
    </span>
  );
}
