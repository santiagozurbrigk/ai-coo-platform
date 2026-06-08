export function SectionHeader({ label }: { label: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
        {label}
      </span>
      <div className="h-px flex-1 bg-border/40" />
    </div>
  );
}
