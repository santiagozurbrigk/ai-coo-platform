import type { LucideIcon } from "lucide-react";

export function SectionHeader({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-2 border-b border-border/40 pb-2.5">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-[13px] font-medium text-foreground">{label}</span>
    </div>
  );
}
