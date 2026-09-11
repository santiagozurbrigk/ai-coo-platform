/**
 * Qué es una "última 1-1" y cuán confiable es su vínculo.
 *
 * ⭐ Vive en su propio módulo, sin importar nada, porque **la tabla de clientes
 * también lo necesita** y es un componente cliente. Importarlo de
 * `one-on-ones.ts` arrastraría al bundle del navegador el módulo que crea el
 * cliente admin de Supabase — el que bypassea RLS y lleva la service role key.
 * Es el mismo motivo por el que `lib/discord/limits.ts` existe aparte.
 */

export type LastOneOnOne = {
  /** Fecha de la llamada (`YYYY-MM-DD`). */
  date: string;
  /** Cómo se resolvió que era con este cliente. Sirve para avisar si es candidato. */
  resolutionMethod: string | null;
  title: string | null;
  fathomUrl: string | null;
};

/**
 * ¿Este vínculo se resolvió de forma determinista, o es un candidato?
 *
 * ⭐ La tabla muestra la fecha igual, pero avisa cuando es un candidato: un
 * nombre repetido alcanza para que la llamada sea de otra persona. Ocultarla
 * hasta que alguien confirme dejaría la columna vacía durante semanas; mostrarla
 * sin avisar diría una fecha que puede no ser de este cliente.
 */
export function isConfirmedResolution(method: string | null): boolean {
  return (
    method === "invitee_email" || method === "speaker_alias" || method === "manual"
  );
}
