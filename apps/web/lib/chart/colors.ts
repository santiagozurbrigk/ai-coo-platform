/**
 * Colores de gráficos SVG — referencian tokens CSS (serie neutra + acento).
 */
export const chartColors = {
  primary: "var(--chart-1)",
  secondary: "var(--chart-2)",
  tertiary: "var(--chart-3)",
  accent: "var(--chart-accent)",
  info: "hsl(var(--info))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  destructive: "hsl(var(--destructive))",
  muted: "hsl(var(--muted-foreground))",
} as const;

export const chartSeriesColors = [
  chartColors.primary,
  chartColors.secondary,
  chartColors.tertiary,
  chartColors.accent,
] as const;

export const chartGradients = {
  primaryArea: (opacityTop = 0.45) => ({
    top: chartColors.primary,
    topOpacity: opacityTop,
    bottom: chartColors.primary,
    bottomOpacity: 0,
  }),
  infoArea: (opacityTop = 0.35) => ({
    top: chartColors.secondary,
    topOpacity: opacityTop,
    bottom: chartColors.secondary,
    bottomOpacity: 0,
  }),
  warningLine: {
    start: chartColors.warning,
    end: "hsl(48 96% 53%)",
  },
} as const;

export const expenseSegmentColors = [
  chartColors.primary,
  chartColors.secondary,
  chartColors.tertiary,
  chartColors.accent,
] as const;

/** @deprecated Use chartSeriesColors */
export const platformRingColors = chartSeriesColors;

export const revenueStackColors = [
  chartColors.primary,
  chartColors.secondary,
  chartColors.tertiary,
] as const;
