/**
 * Colores de gráficos SVG — referencian tokens.css (no hex sueltos).
 */
export const chartColors = {
  primary: "hsl(var(--primary))",
  primaryLight: "hsl(var(--primary-light))",
  secondary: "hsl(var(--chart-secondary))",
  tertiary: "hsl(var(--chart-tertiary))",
  info: "hsl(var(--info))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  destructive: "hsl(var(--destructive))",
  muted: "hsl(var(--muted-foreground))",
  lavender: "hsl(var(--chart-lavender))",
  pink: "hsl(var(--chart-pink))",
} as const;

export const chartGradients = {
  primaryArea: (opacityTop = 0.45) => ({
    top: chartColors.primary,
    topOpacity: opacityTop,
    bottom: chartColors.primary,
    bottomOpacity: 0,
  }),
  infoArea: (opacityTop = 0.35) => ({
    top: chartColors.info,
    topOpacity: opacityTop,
    bottom: chartColors.info,
    bottomOpacity: 0,
  }),
  warningLine: {
    start: chartColors.warning,
    end: "hsl(48 96% 53%)",
  },
} as const;

export const expenseSegmentColors = [
  chartColors.primary,
  chartColors.info,
  chartColors.secondary,
  chartColors.pink,
] as const;

export const platformRingColors = [
  chartColors.primary,
  chartColors.secondary,
  chartColors.warning,
  chartColors.lavender,
] as const;

export const revenueStackColors = [
  chartColors.primary,
  chartColors.info,
  chartColors.tertiary,
] as const;
