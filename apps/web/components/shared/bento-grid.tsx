import { cn } from "@ai-coo/ui";
import type { ReactNode } from "react";

/** Tamaños predefinidos para celdas en grilla de 2 cols (móvil) / 4 cols (lg). */
export type BentoSize = "unit" | "wide" | "tall" | "large" | "banner";

const SIZE_CLASSES: Record<BentoSize, string> = {
  unit: "col-span-1 row-span-1",
  wide: "col-span-2 row-span-1",
  tall: "col-span-1 row-span-2 min-h-[260px]",
  large: "col-span-2 row-span-2 min-h-[280px]",
  banner: "col-span-2 row-span-1 lg:col-span-4",
};

const cellChild =
  "[&>*]:h-full [&>*]:min-h-0 [&_.metric-card]:h-full [&_article]:h-full";

export function BentoGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4",
        "auto-rows-[minmax(128px,auto)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function BentoCell({
  size = "unit",
  className,
  children,
}: {
  size?: BentoSize;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 min-w-0 flex-col",
        SIZE_CLASSES[size],
        cellChild,
        className
      )}
    >
      {children}
    </div>
  );
}

/** Celda con placement explícito (p. ej. héroes lado a lado en dashboard). */
export function BentoCellPlace({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex min-h-0 min-w-0 flex-col", cellChild, className)}>
      {children}
    </div>
  );
}
