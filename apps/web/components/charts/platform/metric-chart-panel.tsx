"use client";

import { GlassPanel, cn } from "@ai-coo/ui";
import type { ReactNode } from "react";

/**
 * Card de métrica con gráfico debajo.
 *
 * El encabezado va en el flujo normal, no flotando sobre el gráfico: la versión
 * anterior lo posicionaba en absolute con un degradado encima, y el gráfico
 * quedaba pisado arriba y con las etiquetas del eje X recortadas contra el
 * borde inferior de la card.
 */
export function MetricChartPanel({
  title,
  value,
  subtitle,
  children,
  className,
  valueClassName,
}: {
  title: string;
  value: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <GlassPanel
      className={cn("flex flex-col gap-4 overflow-hidden p-5", className)}
    >
      <div>
        <p className="text-caption font-medium text-muted-foreground">{title}</p>
        <p
          className={cn(
            // Cifras proporcionales: `tabular-nums` a este tamaño deja los
            // números sueltos. La alineación vertical sólo importa en tablas.
            "mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl",
            valueClassName
          )}
        >
          {value}
        </p>
        {subtitle ? (
          <p className="mt-0.5 text-caption text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-1 items-end">{children}</div>
    </GlassPanel>
  );
}
