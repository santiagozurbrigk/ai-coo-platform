/**
 * D2 · La actividad de un cliente en Discord, y la señal de silencio.
 *
 * ⭐ La conexión de mayor valor y la más barata: no necesita IA ni llamadas
 * externas, sale de contar filas de `discord_messages` que el bot ya guarda.
 *
 * La señal que importa no es "cuánto habla" sino **"hace cuánto que no habla"**:
 * un cliente que dejó de aparecer es la fuga que nadie ve hasta que se va.
 *
 * Lógica pura: no toca base ni red.
 */

/** Lo mínimo que hace falta de un mensaje para medir actividad. */
export type ActivityMessage = {
  sentAt: string;
  isTestimonial?: boolean;
  /**
   * ⭐ Cómo se supo de quién era este mensaje.
   *
   * `"person"` = su autor está vinculado a un cliente: **es el cliente
   * hablando**. `"channel"` = su autor no está vinculado y el canal es de un
   * solo cliente, así que se dedujo. Ausente cuenta como `"person"`, porque
   * antes de que existiera la atribución por canal ésa era la única forma.
   */
  attributedBy?: "person" | "channel" | null;
};

/** Un mensaje que mueve el reloj del silencio: lo escribió el cliente. */
function loEscribioElCliente(message: ActivityMessage): boolean {
  return message.attributedBy !== "channel";
}

/**
 * Días sin hablar a partir de los cuales un cliente cuenta como en silencio.
 *
 * Catorce días es el mismo orden de magnitud que usa el módulo de leads para
 * `stalled`. Es un criterio, no una medición: si con uso real resulta corto o
 * largo, se cambia acá y en un solo lugar.
 */
export const SILENCE_THRESHOLD_DAYS = 14;

const DAY_MS = 24 * 60 * 60 * 1000;

export type ClientActivity = {
  totalMessages: number;
  /** Mensajes en los últimos 7 días. */
  messagesLast7Days: number;
  /** Mensajes en los últimos 30 días. */
  messagesLast30Days: number;
  /** Cuántos de esos mensajes el bot marcó como testimonio. */
  testimonials: number;
  /** ISO del último mensaje. `null` si nunca habló. */
  lastMessageAt: string | null;
  /** Días desde el último mensaje. `null` si nunca habló. */
  daysSinceLastMessage: number | null;
  /**
   * ⭐ En silencio: habló alguna vez y hace más de `SILENCE_THRESHOLD_DAYS` que no.
   *
   * Un cliente que **nunca** habló NO cuenta como en silencio: no hay silencio
   * sin conversación previa, y marcarlo sería confundir "no lo conectamos" con
   * "se está yendo". Eso se ve en `neverSpoke`.
   */
  isSilent: boolean;
  /** Nunca escribió un mensaje. Es un problema distinto al silencio. */
  neverSpoke: boolean;
  /**
   * Mensajes en su espacio que **no** escribió él: se dedujeron del canal.
   * Cuentan como actividad del canal, no como que el cliente habló.
   */
  channelMessages: number;
  /**
   * ⭐ Si el silencio se puede medir.
   *
   * `false` cuando hay actividad en su canal pero ninguna persona vinculada que
   * la haya escrito. Ahí "nunca escribió" sería una conclusión falsa: el
   * problema no es el cliente, es que nadie asoció todavía su usuario de
   * Discord. Son dos cosas distintas y la pantalla las dice distinto.
   */
  silenceMeasurable: boolean;
};

export function summarizeClientActivity(
  messages: readonly ActivityMessage[],
  now: Date = new Date()
): ClientActivity {
  const nowMs = now.getTime();

  /**
   * ⭐ Dos poblaciones, a propósito.
   *
   * Los totales cuentan **todo** lo que pasó en el espacio del cliente: es lo
   * que uno quiere ver al abrir su ficha. El reloj del silencio cuenta **sólo
   * lo que escribió él**.
   *
   * Mezclarlas apaga la alerta sola: en el canal de Juan escribe también el
   * coach, y si eso reiniciara el reloj, el cliente que se está yendo quedaría
   * tapado por la actividad del propio equipo — justo lo contrario de para qué
   * existe la alerta.
   */
  const propios = messages.filter(loEscribioElCliente);
  const channelMessages = messages.length - propios.length;

  const times = propios
    .map((message) => new Date(message.sentAt).getTime())
    .filter((value) => !Number.isNaN(value));

  const todos = messages
    .map((message) => new Date(message.sentAt).getTime())
    .filter((value) => !Number.isNaN(value));

  const testimonials = messages.filter((message) => message.isTestimonial).length;

  if (times.length === 0) {
    return {
      totalMessages: todos.length,
      messagesLast7Days: todos.filter((t) => nowMs - t <= 7 * DAY_MS).length,
      messagesLast30Days: todos.filter((t) => nowMs - t <= 30 * DAY_MS).length,
      testimonials,
      lastMessageAt: null,
      daysSinceLastMessage: null,
      isSilent: false,
      neverSpoke: true,
      channelMessages,
      // Hay movimiento en su canal pero nadie vinculado que lo haya escrito:
      // el silencio no es medible todavía, y decir "nunca escribió" mentiría.
      silenceMeasurable: channelMessages === 0,
    };
  }

  const lastMs = Math.max(...times);
  const daysSince = Math.floor((nowMs - lastMs) / DAY_MS);

  return {
    totalMessages: todos.length,
    messagesLast7Days: todos.filter((t) => nowMs - t <= 7 * DAY_MS).length,
    messagesLast30Days: todos.filter((t) => nowMs - t <= 30 * DAY_MS).length,
    testimonials,
    lastMessageAt: new Date(lastMs).toISOString(),
    daysSinceLastMessage: daysSince,
    isSilent: daysSince >= SILENCE_THRESHOLD_DAYS,
    neverSpoke: false,
    channelMessages,
    silenceMeasurable: true,
  };
}

/** Cómo se lee la actividad de un cliente en una línea. */
export function describeActivity(activity: ClientActivity): string {
  // Antes que nada: si hay mensajes en su canal que no escribió nadie
  // identificado, el problema no es el cliente. Decir "nunca escribió" haría
  // que alguien se preocupe por una relación que en realidad no se sabe cómo
  // está, y que nadie toque lo único que lo arregla: vincular a la persona.
  if (!activity.silenceMeasurable) return "Falta vincular a su usuario";
  if (activity.neverSpoke) return "Nunca escribió";
  if (activity.daysSinceLastMessage === null) return "Sin datos";
  if (activity.daysSinceLastMessage === 0) return "Escribió hoy";
  if (activity.daysSinceLastMessage === 1) return "Escribió ayer";
  return `Hace ${activity.daysSinceLastMessage} días que no escribe`;
}

/** Agrupa mensajes por cliente para resumir todos en una pasada. */
export function summarizeByClient(
  messages: readonly (ActivityMessage & { clientId: string | null })[],
  now: Date = new Date()
): Record<string, ClientActivity> {
  const grouped = new Map<string, ActivityMessage[]>();

  for (const message of messages) {
    // Un mensaje sin cliente vinculado no es actividad de nadie: se ignora en
    // vez de inventarle un dueño.
    if (!message.clientId) continue;
    const list = grouped.get(message.clientId) ?? [];
    list.push(message);
    grouped.set(message.clientId, list);
  }

  const result: Record<string, ClientActivity> = {};
  for (const [clientId, list] of grouped) {
    result[clientId] = summarizeClientActivity(list, now);
  }
  return result;
}
