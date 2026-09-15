/**
 * ⭐ Si el bot tiene permitido escribir en este servidor.
 *
 * El bot habla en exactamente dos momentos —el saludo de un canal nuevo y la
 * respuesta a `!vincular`— y ambos pasan por acá. Todo lo demás (leer, guardar,
 * medir silencio, proponer wins e hitos) no toca esta función: apagar el
 * interruptor calla al bot, no lo ciega.
 *
 * ⚠️ `undefined` significa **sí**, no "no sé". La columna se lee con `select *`,
 * así que si el bot se despliega antes de que corra la migración —o contra una
 * base donde todavía no existe—, el campo llega `undefined`. Tratarlo como
 * silencio dejaría mudos a todos los servidores que hoy funcionan, sin un solo
 * error en el log que lo explique. El default de la columna es `true` por la
 * misma razón.
 *
 * Lógica pura: no toca base ni red.
 */
export function puedeHablar(
  integration: { bot_can_speak?: unknown } | null | undefined
): boolean {
  return integration?.bot_can_speak !== false;
}
