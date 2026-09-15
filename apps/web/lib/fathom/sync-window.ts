/**
 * ⭐ Desde cuándo se le piden llamadas a Fathom.
 *
 * Decisión del 2026-09-15: **desde la conexión en adelante, no el historial**.
 *
 * El costo de traer el historial no es el espacio. Cada llamada que entra se
 * transcribe y se analiza con IA; en una cuenta con años de grabaciones, esa
 * primera corrida cuesta plata de verdad y tarda, para traer conversaciones que
 * en su mayoría ya no le importan a nadie.
 *
 * Antes había dos comportamientos distintos y ninguno era este: la
 * sincronización de la organización barría los últimos 90 días, y la de un
 * miembro traía **todo** lo que la cuenta tuviera. Esta función es ahora la
 * única regla, para las dos.
 *
 * Lógica pura: no toca base ni red.
 */

export type VentanaDeSync = {
  /** Fecha ISO desde la cual pedir. `null` = sin filtro (traer todo). */
  desde: string | null;
  /** Por qué se eligió. Va al log: cuando algo no llega, esto lo explica. */
  motivo: "incremental" | "desde-la-conexion" | "sin-referencia";
};

/**
 * @param lastSyncAt Última vez que se trajo algo. Manda cuando existe.
 * @param connectedAt Cuándo se conectó la cuenta. La línea de largada.
 */
export function resolverVentanaDeSync(
  lastSyncAt: string | null | undefined,
  connectedAt: string | null | undefined
): VentanaDeSync {
  const ultima = fechaValida(lastSyncAt);
  const conexion = fechaValida(connectedAt);

  /**
   * ⭐ Se toma la **más vieja** de las dos, no `last_sync_at` a secas.
   *
   * Si una corrida falla a mitad y `last_sync_at` quedó adelantado, arrancar
   * desde ahí se saltearía en silencio las llamadas de ese hueco. Retroceder
   * hasta la conexión, en el peor caso, vuelve a traer algo que ya está — y
   * volver a traer una llamada no la duplica, mientras que perderla no se
   * recupera nunca.
   *
   * Sólo aplica cuando `last_sync_at` es **anterior** a la conexión, que es el
   * síntoma de un reloj mal puesto o de una reconexión; en el caso normal la
   * última sincronización es posterior y manda ella.
   */
  if (ultima && conexion) {
    const desde = ultima < conexion ? conexion : ultima;
    return {
      desde,
      motivo: desde === conexion ? "desde-la-conexion" : "incremental",
    };
  }

  if (ultima) return { desde: ultima, motivo: "incremental" };
  if (conexion) return { desde: conexion, motivo: "desde-la-conexion" };

  /**
   * Sin ninguna de las dos fechas no hay línea de largada que respetar.
   *
   * Pasa sólo con filas anteriores a esta decisión que además nunca
   * sincronizaron. Se devuelve `null` —traer todo— en vez de inventar una
   * fecha: un filtro inventado esconde llamadas sin dejar rastro, y eso es
   * peor que una primera corrida cara. El motivo queda en el log.
   */
  return { desde: null, motivo: "sin-referencia" };
}

function fechaValida(valor: string | null | undefined): string | null {
  if (!valor) return null;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha.toISOString();
}
