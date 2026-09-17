/**
 * ⭐ A quién se parece un usuario de Discord.
 *
 * Sugiere, **nunca decide**. Un nombre parecido no es una identidad: marcar a un
 * cliente como "equipo" por error hace que sus mensajes dejen de contarse, y
 * eso no se nota nunca —la ficha simplemente se queda quieta—. Cada sugerencia
 * la confirma una persona con un clic.
 *
 * Por qué existe: en el servidor real, 4 de las 7 personas que escribieron son
 * del propio equipo, y dos coinciden con nombre y apellido exactos. Sin
 * sugerencias, eso son 7 desplegables a mano contra una lista de 335 clientes y
 * 9 personas del equipo; con sugerencias, 7 confirmaciones.
 *
 * Lógica pura: no toca base ni red.
 */

export type NivelDeCoincidencia = "exacto" | "fuerte" | "posible";

export type Candidato = { id: string; nombre: string };

export type Sugerencia = {
  id: string;
  nombre: string;
  nivel: NivelDeCoincidencia;
};

/**
 * Deja un nombre en letras minúsculas sin acentos ni separadores.
 *
 * ⭐ Sacar los separadores es lo que hace funcionar el caso más común: el
 * usuario de Discord `luckasfalco` y el nombre cargado "Luckas Falco" son el
 * mismo texto una vez que se quitan el espacio y la mayúscula. Sin esto, la
 * coincidencia más obvia de todas se pierde.
 */
function aplanar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/** Los pedazos de un nombre: "Luckas Falco" → ["luckas", "falco"]. */
function partes(texto: string): string[] {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((parte) => parte.length > 0);
}

/**
 * Cuántos caracteres tiene que compartir un apodo con un nombre para creerle.
 *
 * Con dos, "Na" coincidiría con "Nazareno", "Natalia" y "Nahuel" a la vez. Tres
 * es el mínimo donde un apodo real ("Fede", "Santi", "Naza") todavía entra y el
 * ruido ya no.
 */
const MINIMO_PARA_APODO = 3;

function nivelEntre(
  nombreDiscord: string,
  nombreCandidato: string
): NivelDeCoincidencia | null {
  const planoDiscord = aplanar(nombreDiscord);
  const planoCandidato = aplanar(nombreCandidato);

  if (!planoDiscord || !planoCandidato) return null;
  if (planoDiscord === planoCandidato) return "exacto";

  const deDiscord = partes(nombreDiscord);
  const delCandidato = partes(nombreCandidato);
  if (deDiscord.length === 0 || delCandidato.length === 0) return null;

  // El más corto tiene que estar entero dentro del más largo: "Thiago" dentro
  // de "Thiago Azcurra". Al revés no —"Thiago Azcurra" no está en "Thiago"—,
  // por eso se compara el corto contra el largo y no a la inversa.
  const [corto, largo] =
    deDiscord.length <= delCandidato.length
      ? [deDiscord, delCandidato]
      : [delCandidato, deDiscord];

  if (corto.every((parte) => largo.includes(parte))) return "fuerte";

  /**
   * El apodo: "Santi" contra "Santiago Molina", "Naza" contra "Nazareno".
   *
   * Es el nivel donde más se equivoca, y por eso se muestra distinto: una
   * confirmación apurada acá es la que mete a un cliente en el equipo.
   */
  const porApodo = corto.every((parte) =>
    largo.some(
      (otra) =>
        parte.length >= MINIMO_PARA_APODO &&
        (otra.startsWith(parte) || parte.startsWith(otra))
    )
  );

  return porApodo ? "posible" : null;
}

const ORDEN: Record<NivelDeCoincidencia, number> = {
  exacto: 0,
  fuerte: 1,
  posible: 2,
};

/**
 * La mejor coincidencia entre los nombres de una persona y una lista.
 *
 * @param nombres Del usuario de Discord: su nombre visible y su usuario. Se
 *   prueban los dos porque no siempre coinciden —"Nazareno Gamero" y `nazag`—, y
 *   cuál de los dos sirve depende de cómo se haya configurado cada quien.
 */
export function sugerirIdentidad(
  nombres: readonly (string | null | undefined)[],
  candidatos: readonly Candidato[]
): Sugerencia | null {
  const limpios = nombres.filter((nombre): nombre is string =>
    Boolean(nombre?.trim())
  );
  if (limpios.length === 0) return null;

  let mejor: Sugerencia | null = null;

  for (const candidato of candidatos) {
    if (!candidato.nombre?.trim()) continue;

    for (const nombre of limpios) {
      const nivel = nivelEntre(nombre, candidato.nombre);
      if (!nivel) continue;

      if (!mejor || ORDEN[nivel] < ORDEN[mejor.nivel]) {
        mejor = { id: candidato.id, nombre: candidato.nombre, nivel };
      }

      // No hay nada mejor que un nombre idéntico: cortar acá evita recorrer 335
      // clientes al pedo y, sobre todo, evita que un empate posterior lo pise.
      if (nivel === "exacto") return mejor;
    }
  }

  return mejor;
}
