import type { CSSProperties } from "react";

/**
 * Superficies de categoría (badges, pills, nodos de grafo) sobre la misma
 * paleta categórica validada que usan los gráficos (`--chart-cat-*`).
 *
 * Por qué no clases de Tailwind: cada categoría necesita tres derivados del
 * mismo color (relleno tenue, borde, tinta de texto) en dos temas. Con clases
 * eso son seis strings por categoría que hay que mantener en sincronía a mano,
 * que es justamente como el violeta de la marca vieja sobrevivió en cinco
 * archivos. Acá el color sale de un token y los derivados se calculan.
 *
 * `--chart-cat-N` está validado a ≥3:1 (umbral de marca, no de texto), así que
 * el texto usa `--chart-cat-N-ink`, que clarea 4.5:1 en ambos temas.
 */

/** Cantidad de slots con identidad propia. Coincide con `CHART_MAX_SERIES`. */
export const CATEGORY_SLOTS = 6;

export interface CategorySurfaceOptions {
  /** Opacidad del relleno, 0–100. Default 10. */
  fill?: number;
  /** Opacidad del borde, 0–100. Default 28. */
  border?: number;
  /**
   * Aplicar la tinta de texto de la categoría. Default `true`.
   * Poner en `false` cuando la superficie envuelve texto propio (una card, un
   * nodo de grafo) que tiene que seguir usando el color de texto del tema.
   */
  ink?: boolean;
}

function slot(index: number): number {
  // Se cicla sólo como red de seguridad: las listas de categorías de la app
  // entran en los seis slots. Si alguna crece, agrupar en "Otros".
  return (((index % CATEGORY_SLOTS) + CATEGORY_SLOTS) % CATEGORY_SLOTS) + 1;
}

/** Color pleno de la categoría (puntos de leyenda, barras, marcas). */
export function categoryColor(index: number): string {
  return `var(--chart-cat-${slot(index)})`;
}

/** Tinta de texto de la categoría, con contraste de texto. */
export function categoryInk(index: number): string {
  return `var(--chart-cat-${slot(index)}-ink)`;
}

/**
 * Estilo de superficie tenue para un badge o card de categoría.
 * Los tokens cambian con el tema, así que el estilo sirve en claro y oscuro
 * sin variantes `dark:`.
 */
export function categorySurface(
  index: number,
  { fill = 10, border = 28, ink = true }: CategorySurfaceOptions = {}
): CSSProperties {
  const color = categoryColor(index);
  return {
    backgroundColor: `color-mix(in oklch, ${color} ${fill}%, transparent)`,
    borderColor: `color-mix(in oklch, ${color} ${border}%, transparent)`,
    ...(ink ? { color: categoryInk(index) } : null),
  };
}
