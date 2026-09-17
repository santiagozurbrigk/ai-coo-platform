/**
 * ⭐ De quién es un mensaje de Discord.
 *
 * Antes había una sola fuente: si el **autor** estaba vinculado a un cliente, el
 * mensaje era de ese cliente; si no, de nadie. Y vincularse dependía de que el
 * cliente escribiera `!vincular` por su cuenta. Medido en producción el
 * 2026-09-17: 335 clientes, **1 persona vinculada**, 15 de 16 mensajes sin
 * dueño. La alerta de silencio estaba enchufada y midiendo el vacío.
 *
 * Ahora hay una segunda fuente —el dueño del canal— pero **no son
 * intercambiables**, y por eso el resultado dice de dónde salió:
 *
 * - `"person"`: lo escribió alguien vinculado. Es el cliente hablando. Mueve el
 *   reloj del silencio.
 * - `null`: nadie. O el autor es del equipo —y entonces no es actividad de
 *   ningún cliente—, o no hay de dónde deducirlo.
 * - `"channel"`: el autor no está vinculado y el canal es de un solo cliente.
 *   Es actividad en su espacio, que no es lo mismo. **No** mueve el reloj: en el
 *   canal de Juan también escribe el coach, y si eso reiniciara el reloj, el
 *   cliente que se está yendo quedaría tapado por la actividad del propio
 *   equipo.
 *
 * Lógica pura: no toca base ni red.
 */

export type Atribucion = {
  clientId: string | null;
  attributedBy: "person" | "channel" | null;
};

export function atribuirMensaje(
  /** Cliente al que está vinculado el autor, si lo está. */
  clienteDelAutor: string | null | undefined,
  /** Clientes dueños del canal donde se escribió. */
  clientesDelCanal: readonly string[],
  /** Si el autor es gente del equipo del negocio, no un cliente. */
  autorEsDelEquipo = false
): Atribucion {
  /**
   * ⭐ El equipo corta antes que todo lo demás.
   *
   * En el canal de Juan también escribe el coach. Ese mensaje no es actividad
   * de Juan **en ningún sentido**: no es él hablando ni es movimiento del que
   * se pueda deducir algo sobre él. Atribuírselo le mete conversaciones ajenas
   * en la ficha y le infla los totales.
   *
   * Va antes del vínculo de persona a propósito: si alguien quedó marcado como
   * equipo **y** vinculado a un cliente —la aplicación lo impide, pero una fila
   * vieja podría—, la respuesta segura es no atribuir. Un mensaje sin dueño se
   * arregla marcando bien a la persona; uno atribuido de más ya ensució una
   * ficha y nadie va a mirar por qué.
   */
  if (autorEsDelEquipo) {
    return { clientId: null, attributedBy: null };
  }

  if (clienteDelAutor) {
    return { clientId: clienteDelAutor, attributedBy: "person" };
  }

  /**
   * Con dos o más dueños no hay forma de saber cuál de ellos escribió, y elegir
   * el primero sería inventar. Queda sin dueño hasta que su autor se vincule,
   * que es la única fuente que sí lo sabe.
   */
  if (clientesDelCanal.length === 1) {
    return { clientId: clientesDelCanal[0], attributedBy: "channel" };
  }

  return { clientId: null, attributedBy: null };
}
