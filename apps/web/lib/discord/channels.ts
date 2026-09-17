/**
 * ⭐ De quién es un canal de Discord, y si ahí se buscan logros.
 *
 * Viene de un pedido concreto: *"poder decirle al sistema: este canal pertenece
 * a este/estos clientes. Y por otro lado, este canal es comunitario —por ejemplo
 * el de wins— ahí el bot es cuando debe reconocer las wins"*.
 *
 * Son dos preguntas distintas y acá quedan separadas, porque en un servidor real
 * no coinciden: `#chat-general` es comunitario y no es un canal de logros.
 * Atarlas llenaría el buzón de wins con saludos.
 *
 * Lógica pura: no toca base ni red.
 */

/** Qué es un canal para el sistema. */
export type ChannelPurpose =
  /** Es de uno o más clientes concretos (ver `discord_channel_clients`). */
  | "client"
  /** Escriben muchos clientes. No se atribuye nada por el canal. */
  | "community";

export type MonitoredChannel = {
  channel_id: string;
  channel_name: string;
  purpose: ChannelPurpose;
  /** Si el bot busca logros acá. Siempre explícito una vez guardado. */
  wins: boolean;
  added_at?: string;
};

/**
 * Lee un canal guardado, venga con la forma que venga.
 *
 * ⚠️ `purpose` existe desde el día uno con cuatro valores —`clients`,
 * `testimonials`, `general`, `auto`— y **nadie lo elegía**: la pantalla escribía
 * `'clients'` fijo en todos. La migración los pasa a los dos valores nuevos,
 * pero una fila puede llegar acá sin migrar (una copia vieja, un entorno a
 * medio actualizar), y ahí lo correcto es `community`: es el valor que **no
 * atribuye nada**, o sea el comportamiento que esa fila ya tenía.
 *
 * Confundirse para el otro lado repartiría mensajes entre clientes que nadie
 * eligió, y eso no se nota hasta que alguien mira una ficha y ve conversaciones
 * ajenas.
 */
export function normalizarCanal(raw: unknown): MonitoredChannel | null {
  if (!raw || typeof raw !== "object") return null;
  const canal = raw as Record<string, unknown>;

  const channelId = typeof canal.channel_id === "string" ? canal.channel_id : "";
  if (!channelId) return null;

  const channelName =
    typeof canal.channel_name === "string" ? canal.channel_name : "";

  return {
    channel_id: channelId,
    channel_name: channelName,
    purpose: canal.purpose === "client" ? "client" : "community",
    wins:
      typeof canal.wins === "boolean"
        ? canal.wins
        : // Sin valor guardado, la única pista es el nombre — la misma que
          // usaba el bot antes de que esto fuera configurable.
          sugerirWins(channelName),
    added_at: typeof canal.added_at === "string" ? canal.added_at : undefined,
  };
}

export function normalizarCanales(raw: unknown): MonitoredChannel[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(normalizarCanal)
    .filter((canal): canal is MonitoredChannel => canal !== null);
}

/** Nombres que sugieren un canal de logros. Sugiere: el usuario decide. */
const NOMBRES_DE_LOGROS = [
  "testimoni",
  "win",
  "caso",
  "exito",
  "éxito",
  "logro",
  "resultado",
  "achievement",
];

/**
 * Si el nombre de un canal sugiere que ahí se comparten logros.
 *
 * Se usa **sólo al agregar un canal**, para dejar el tilde puesto en el valor
 * más probable. Después manda lo guardado: si el usuario lo destilda, se queda
 * destildado aunque el canal se llame `wins`.
 */
export function sugerirWins(channelName: string): boolean {
  const nombre = channelName.toLowerCase();
  return NOMBRES_DE_LOGROS.some((patron) => nombre.includes(patron));
}

/**
 * ⭐ El cliente al que se le puede atribuir un mensaje por su canal.
 *
 * Devuelve el cliente **sólo si el canal tiene exactamente uno**. Con dos o más
 * dueños no hay forma de saber cuál de ellos escribió, y elegir el primero
 * sería inventar: el mensaje queda sin dueño hasta que su autor se vincule,
 * que es la única fuente que sí lo sabe.
 */
export function clienteDelCanal(clientIds: readonly string[]): string | null {
  return clientIds.length === 1 ? clientIds[0] : null;
}
