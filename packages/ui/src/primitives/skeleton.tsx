import { cn } from "../lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-[length:200%_100%] before:bg-gradient-to-r before:from-transparent before:via-foreground/5 before:to-transparent motion-reduce:before:animate-none",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
