/**
 * ⭐ El estado de uso de un win: la diferencia entre registrar y recordar.
 *
 * `win_usages` guarda **dónde se usó** cada caso. Esto responde la otra
 * pregunta, que es la razón de ser del tracker: **¿cuáles todavía no usé?**
 *
 * > *"Un resultado que no se convierte en marketing es un resultado
 * > desperdiciado. Este archivo existe para que ninguno se te escape."*
 *
 * Lógica pura: no toca base ni red.
 */
import type { UsageState } from "@/types/wins";

/**
 * El estado real de un win.
 *
 * `used` y `unused` **se derivan** de si tiene usos registrados: pedirle a
 * alguien que marque "usada" además de cargar dónde la usó es pedir el mismo
 * dato dos veces, y el segundo siempre queda desactualizado.
 *
 * `reserved` es la excepción: *"lo guardo para el lanzamiento"* es una decisión
 * que no se puede deducir de nada, así que esa sí se declara — y **se respeta
 * hasta que efectivamente se use**.
 */
export function resolveUsageState(
  declaredState: UsageState,
  usageCount: number
): UsageState {
  if (usageCount > 0) return "used";
  if (declaredState === "reserved") return "reserved";
  return "unused";
}

/**
 * Los wins que están esperando algo. Es la lista que el Excel pone adelante.
 *
 * Un win sin usar **y** sin permiso es el que más lejos está de servir: hay que
 * preguntarle al cliente antes de poder hacer nada con él.
 */
export function pendingAttention<
  T extends { usageState: UsageState; canPublish: boolean; needsScreenshot: boolean }
>(wins: readonly T[]): { readyToUse: T[]; needsConsent: T[]; needsScreenshot: T[] } {
  const unused = wins.filter((win) => win.usageState === "unused");

  return {
    /** Sin usar, con permiso y con captura: se puede publicar hoy. */
    readyToUse: unused.filter((win) => win.canPublish && !win.needsScreenshot),
    /** Sin usar y sin permiso: falta la conversación con el cliente. */
    needsConsent: unused.filter((win) => !win.canPublish),
    /** Falta la captura, que hay que sacar el día que pasó. */
    needsScreenshot: wins.filter((win) => win.needsScreenshot),
  };
}
