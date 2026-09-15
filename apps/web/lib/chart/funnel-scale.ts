/**
 * Escala de un embudo: de los valores de cada etapa a la fracción del alto (o
 * ancho) que le toca dibujar, y al porcentaje que se muestra encima.
 *
 * ⭐ **Por qué existe.** El chart normalizaba contra `data[0]`, asumiendo que la
 * primera etapa siempre es la más grande. Cuando no lo es —un embudo al que le
 * faltan las etapas de arriba porque su fuente de datos quedó vacía— la
 * fracción se va por encima de 1 y el path se dibuja cientos de veces más alto
 * que su celda. En el panel general, un embudo que arrancaba en "1 cierre" y
 * seguía con "263 clientes activos" pintaba la card entera de naranja y la
 * etiqueta decía **26300%**.
 *
 * La normalización va contra el **máximo** y queda acotada a `[0, 1]`. En un
 * embudo sano —el que decrece etapa a etapa— el máximo *es* la primera etapa y
 * el resultado es idéntico al de antes: esto no cambia ningún gráfico correcto,
 * sólo evita que uno incorrecto se salga de su caja.
 */

function clamp01(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return value > 1 ? 1 : value;
}

export type FunnelScale = {
  /** Fracción de la celda que ocupa cada etapa, siempre dentro de `[0, 1]`. */
  norms: number[];
  /** Porcentaje que se muestra sobre cada etapa, siempre dentro de `[0, 100]`. */
  percentages: number[];
};

export function funnelScale(values: number[]): FunnelScale {
  const max = values.reduce(
    (acc, value) => (Number.isFinite(value) && value > acc ? value : acc),
    0
  );

  // Sin ninguna etapa con dato no hay escala posible: dividir por cero daría
  // `Infinity` y el path se volvería a ir de la celda.
  if (max <= 0) {
    return {
      norms: values.map(() => 0),
      percentages: values.map(() => 0),
    };
  }

  const norms = values.map((value) => clamp01(value / max));
  return { norms, percentages: norms.map((norm) => norm * 100) };
}
