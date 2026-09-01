/**
 * lib/funnels/source-signal.ts
 *
 * Cierra el agujero que quedó abierto en la Fase 1: una fuente **bindeada a una
 * tabla que nunca se pobló** devolvía `0`, y el módulo lee ese cero como una
 * rotura de negocio.
 *
 * Es el modo de falla de docs/FUNNELS_ARCHITECTURE.md §9.1 entrando por otra
 * puerta. El diseño contemplaba "sin binding → null" pero no este caso
 * intermedio, que es el que más se da en una org recién configurada.
 *
 * La regla, en tres estados:
 *
 * | Situación                                          | Resultado |
 * |----------------------------------------------------|-----------|
 * | Hay filas en el período                            | el conteo real |
 * | Cero en el período, pero la org tiene filas antes  | `0` — es un cero de verdad |
 * | Cero en el período y la org NUNCA tuvo filas       | `null` — falta instrumentación |
 *
 * Todo lo de este archivo es puro salvo `resolveWithSignal`, que hace una única
 * consulta extra y **sólo cuando el conteo del período dio cero**.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ClosingCallStatus } from "@/types/closing";
import { callWasAttended, callIsSale } from "@/lib/closing/call-status";

/**
 * Estado de una llamada de cierre, tal como lo modela `closing_calls`.
 *
 * Es un alias, no una copia: cuando la lista duplicada se quedó atrás fue así
 * como `attended` dejó de contarse en la asistencia del embudo.
 */
export type CallStatus = ClosingCallStatus;

export type CallOutcomeCounts = {
  /** Asistieron: asistidas, cerradas o no cerradas. `null` si no hay resultados. */
  attended: number | null;
  /** Cerradas. `null` si nadie registró resultados. */
  closed: number | null;
  /** Llamadas del período, en cualquier estado. */
  total: number;
  /** `true` cuando al menos una llamada salió de `scheduled`. */
  hasOutcomes: boolean;
};

/**
 * Cuenta asistencia y cierres distinguiendo "nadie asistió" de "nadie cargó el
 * resultado".
 *
 * Si TODAS las llamadas del período siguen en `scheduled`, el resultado no está
 * siendo registrado y se devuelve `null`. Reportar 0 diría que nadie asistió a
 * ninguna llamada, que es una afirmación muy distinta y mucho peor.
 *
 * Un `no_show` SÍ es un resultado cargado: significa que alguien miró la llamada
 * y registró que el lead no vino. Por eso una org con llamadas `scheduled` y
 * `no_show` sí tiene señal, y su cero de asistencia es real.
 *
 * Una `cancelled`, en cambio, **no** es señal de asistencia: la llamada nunca
 * ocurrió, así que no dice nada sobre si los leads se presentan. Un período con
 * sólo agendadas y canceladas sigue sin resultados cargados.
 */
export function resolveCallOutcomes(statuses: CallStatus[]): CallOutcomeCounts {
  const total = statuses.length;
  const hasOutcomes = statuses.some((s) => s !== "scheduled" && s !== "cancelled");

  if (!hasOutcomes) {
    return { attended: null, closed: null, total, hasOutcomes: false };
  }

  return {
    attended: statuses.filter(callWasAttended).length,
    closed: statuses.filter(callIsSale).length,
    total,
    hasOutcomes: true,
  };
}

/**
 * Envuelve el conteo de una fuente con la detección de fuente vacía.
 *
 * `countInPeriod` es lo que dio el período. `countAllTime` sólo se invoca si ese
 * conteo fue cero, así que en el caso normal no cuesta nada.
 */
export async function resolveWithSignal(
  countInPeriod: number | null,
  countAllTime: () => Promise<number | null>
): Promise<number | null> {
  if (countInPeriod === null) return null;
  if (countInPeriod > 0) return countInPeriod;

  // Cero en el período: hay que distinguir si la fuente alguna vez tuvo datos.
  const historical = await countAllTime();
  if (historical === null) return null;
  return historical > 0 ? 0 : null;
}

/** Cuenta filas de una tabla para la org, sin filtro de fecha. */
export async function countAllTimeRows(
  supabase: SupabaseClient,
  table: string,
  organizationId: string
): Promise<number | null> {
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .limit(1);

  return error ? null : (count ?? 0);
}
