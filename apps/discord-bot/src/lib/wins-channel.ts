/**
 * La pista del nombre para el tilde «acá se comparten logros».
 *
 * ⭐ Es una **sugerencia inicial, no una regla**. Se consulta una sola vez, al
 * agregar un canal, y el valor queda guardado; después manda lo guardado.
 *
 * Antes esta lista se consultaba en cada mensaje y era la única forma de que un
 * canal buscara logros: un canal con otro nombre no se detectaba nunca, y
 * `#chat-general` no podía serlo aunque el usuario quisiera. Ahora el usuario
 * puede destildar `#wins` o tildar cualquier otro, y su decisión gana.
 *
 * La misma lista vive en `apps/web/lib/discord/channels.ts` (`sugerirWins`),
 * porque el bot y la aplicación son paquetes separados. Se usa **sólo al
 * escribir**, en los dos lados, así que no pueden contradecirse en caliente: lo
 * que decide siempre es el booleano guardado.
 */
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

export function buscaLogrosPorNombre(channelName: string): boolean {
  const nombre = channelName.toLowerCase();
  return NOMBRES_DE_LOGROS.some((patron) => nombre.includes(patron));
}
