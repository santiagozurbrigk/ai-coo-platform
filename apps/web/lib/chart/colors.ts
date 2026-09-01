/**
 * Colores de gráficos SVG — referencian tokens CSS, así que siguen al tema.
 *
 * Hay tres familias y cada una hace un trabajo distinto:
 * - `chartColors` / `--chart-1…5`: rampa **monocroma**, codifica magnitud
 *   dentro de una sola serie (jerarquía, no identidad).
 * - `chartCategoricalColors` / `--chart-cat-*`: identidad de serie.
 * - `chartOrdinalColors` / `--chart-ordinal-*`: posición en una secuencia.
 *
 * Elegir la familia equivocada es el error más caro: pintar categorías con la
 * rampa monocroma deja dos series contiguas como el mismo gris con distinta
 * opacidad.
 */
export const chartColors = {
  primary: "var(--chart-1)",
  secondary: "var(--chart-2)",
  tertiary: "var(--chart-3)",
  accent: "var(--chart-accent)",
  /** Solid primary line (charts) */
  line: "var(--chart-1)",
  info: "hsl(var(--info))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  destructive: "hsl(var(--destructive))",
  muted: "hsl(var(--muted-foreground))",
} as const;

/**
 * Paleta categórica — codifica **identidad de serie**, no magnitud.
 *
 * El orden es fijo y las series se asignan por índice de forma estable: filtrar
 * una serie no debe repintar a las que quedan. Nunca se cicla — a partir de la
 * séptima serie hay que agrupar en "Otros" o pasar a small multiples.
 *
 * Los valores viven en `globals.css` (`--chart-cat-*`) para que cambien con el
 * tema. Ambos sets están validados: banda de lightness, piso de croma,
 * separación de pares adyacentes bajo protanopía/deuteranopía, piso de visión
 * normal y contraste ≥3:1 contra la superficie de la card.
 */
export const chartCategoricalColors = [
  "var(--chart-cat-1)",
  "var(--chart-cat-2)",
  "var(--chart-cat-3)",
  "var(--chart-cat-4)",
  "var(--chart-cat-5)",
  "var(--chart-cat-6)",
] as const;

/** Máximo de series con identidad propia antes de agrupar en "Otros". */
export const CHART_MAX_SERIES = chartCategoricalColors.length;

/** Color de la serie `index`. Fuera de rango devuelve el gris de "Otros". */
export function categoricalColor(index: number): string {
  return chartCategoricalColors[index] ?? chartColors.muted;
}

/**
 * Rampa ordinal — codifica **posición en una secuencia** (etapas de embudo,
 * tiers, buckets). Un solo tono con lightness monótona, para que el orden se
 * lea en el color. No usar para categorías nominales.
 *
 * El paso más alto es siempre el de mayor contraste contra el fondo del tema
 * activo, así que la última etapa —la de marcas más chicas— es la que mejor se
 * ve. Los valores se invierten entre claro y oscuro en `globals.css`.
 */
export const chartOrdinalColors = [
  "var(--chart-ordinal-1)",
  "var(--chart-ordinal-2)",
  "var(--chart-ordinal-3)",
  "var(--chart-ordinal-4)",
  "var(--chart-ordinal-5)",
] as const;

/** Paso `index` de la rampa ordinal, interpolado sobre `total` etapas. */
export function ordinalColor(index: number, total: number): string {
  if (total <= 1) return chartOrdinalColors[1];
  const step = Math.round((index / (total - 1)) * (chartOrdinalColors.length - 1));
  return chartOrdinalColors[Math.min(chartOrdinalColors.length - 1, Math.max(0, step))];
}

/** Superficie de la card — separa marcas contiguas sin dibujarles un borde. */
export const chartSurface = "var(--chart-surface)";

/**
 * Series con identidad propia (multiserie genérica).
 * Antes apuntaba a la rampa monocroma; ver nota arriba.
 */
export const chartSeriesColors = chartCategoricalColors;

/** Segmentos de gasto: son rubros distintos, no niveles de una escala. */
export const expenseSegmentColors = chartCategoricalColors;

/** Segmentos de una barra apilada de facturación: productos, no magnitudes. */
export const revenueStackColors = chartCategoricalColors;

/** @deprecated Use chartSeriesColors */
export const platformRingColors = chartSeriesColors;

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
