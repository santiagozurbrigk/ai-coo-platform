export function RateBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="mt-2">
      {label ? (
        <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
          <span>{label}</span>
          <span>{value}%</span>
        </div>
      ) : (
        <div className="mb-1 flex justify-end text-[11px] text-muted-foreground">
          <span>{value}%</span>
        </div>
      )}
      <div className="h-[3px] overflow-hidden rounded-full bg-border/40">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}
