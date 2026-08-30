/**
 * lib/zernio/triggers.ts
 *
 * M34 (`dm_triggers`) — unidad I-10.
 *
 * Es la etapa Click del embudo DM: "Trigger (comment / story / ad)", o sea lo
 * que ocurre **antes** de que exista la conversación.
 *
 * El documento no le asigna herramienta en su tabla de instrumentación, y es la
 * única fila con benchmark `context-set` — el propio estándar reconoce que no
 * tiene piso universal. Las tres partes del trigger salen de lugares distintos:
 *
 * | Parte | De dónde | Estado |
 * |---|---|---|
 * | **ads** | Meta, vía `ad_metrics_daily` (M04) | ya existe como fuente `ad_clicks` |
 * | **comentarios** | Zernio `listComments` | esta unidad |
 * | **historias** | Zernio `listInstagramStories` | ⛔ **imposible de periodizar** |
 *
 * ⛔ **Las historias no se pueden contar en un período.** Meta sólo expone las
 * historias **vigentes**, o sea una ventana de 24 horas
 * (`lib/zernio/client.ts`, `listInstagramStories`). Para cualquier período que
 * no sea "hoy" no hay nada que leer, y no es un problema de OTC: el dato no
 * existe del lado de Meta. Por eso M34 cubre ads + comentarios, y esa limitación
 * queda dicha en vez de disimulada.
 *
 * Puro: se testea sin red.
 */

/** Lo mínimo que hace falta de un comentario para poder periodizarlo. */
export type TriggerComment = { createdAt: string };

export type TriggerCount = {
  value: number | null;
  /**
   * Por qué no hay número.
   *
   * - `no_comments` — la cuenta no devolvió ninguno.
   * - `window_too_short` — los comentarios que devolvió son **todos** posteriores
   *   al inicio del período, así que no se puede saber si faltan más viejos.
   */
  reason: "no_comments" | "window_too_short" | null;
  /** Comentario más antiguo que se llegó a ver, para poder decirlo en la UI. */
  oldestSeen: string | null;
};

/**
 * Cuenta los comentarios del período.
 *
 * ⭐ **`listComments` es un inbox, no un historial.** No acepta filtro de fecha
 * ni cursor: devuelve una ventana reciente de tamaño desconocido. Contar lo que
 * cae dentro del período y presentarlo como el total sería reportar un número
 * incompleto como si fuera completo — el mismo error que el período ciego de GHL,
 * entrando por otra puerta.
 *
 * La única evidencia de que la ventana cubre el período es **haber visto un
 * comentario más viejo que su inicio**. Si el más antiguo que volvió ya está
 * dentro del período, el borde de la ventana es indistinguible de un borde real
 * de datos, y la respuesta honesta es `null`.
 *
 * Eso hace que un período legítimamente vacío a veces diga "sin datos" en vez de
 * `0`. Es el error barato: preferimos callar de más antes que afirmar un cero que
 * no podemos sostener.
 */
export function countCommentTriggers(
  comments: TriggerComment[],
  periodFromIso: string,
  periodToIso: string
): TriggerCount {
  if (comments.length === 0) {
    return { value: null, reason: "no_comments", oldestSeen: null };
  }

  let oldest: string | null = null;
  for (const comment of comments) {
    if (typeof comment?.createdAt !== "string" || !comment.createdAt) continue;
    if (oldest === null || comment.createdAt < oldest) oldest = comment.createdAt;
  }

  if (oldest === null) {
    // Vinieron comentarios pero ninguno con fecha legible: no se puede periodizar.
    return { value: null, reason: "no_comments", oldestSeen: null };
  }

  if (oldest >= periodFromIso) {
    return { value: null, reason: "window_too_short", oldestSeen: oldest };
  }

  const value = comments.filter(
    (comment) =>
      typeof comment?.createdAt === "string" &&
      comment.createdAt >= periodFromIso &&
      comment.createdAt < periodToIso
  ).length;

  return { value, reason: null, oldestSeen: oldest };
}
