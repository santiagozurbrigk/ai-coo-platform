/**
 * B · L2 — Sembrar las identidades con las que se reconoce a la contraparte.
 *
 * ⭐ El peldaño 1 del resolvedor busca el mail del invitado en
 * `client_identities`, y esa tabla **nace vacía**. Sin sembrarla, el resolvedor
 * no resuelve nada: cada llamada cae al último peldaño y pide confirmación.
 *
 * Lo que se siembra sale de lo que ya está cargado en el CRM:
 *
 *   · el **mail** del cliente o del lead — determinista;
 *   · su **nombre** y su **apodo** — candidatos, porque dos personas pueden
 *     llamarse igual y meter una llamada en la ficha equivocada.
 *
 * El `speaker_alias` —el peldaño que termina resolviendo las entregas— **no se
 * siembra**: se aprende cuando alguien confirma una llamada a mano. Inventarlo
 * desde el nombre sería convertir un candidato en determinista sin que nadie lo
 * haya confirmado.
 *
 * Lógica pura: no toca base ni red.
 */
import type { IdentitySource, IdentityType } from "@/types/fathom-identities";
import { normalizeIdentity } from "@/lib/fathom/resolve-counterparty";
import { normalizeEmail } from "@/lib/fathom/invitees";

export type SeedablePerson = {
  /** Uno de los dos, nunca los dos. */
  clientId: string | null;
  leadId: string | null;
  name: string | null;
  nickname?: string | null;
  email?: string | null;
};

export type IdentitySeed = {
  clientId: string | null;
  leadId: string | null;
  identityType: IdentityType;
  value: string;
  normalizedValue: string;
  source: IdentitySource;
};

/**
 * Las identidades a sembrar para una lista de personas.
 *
 * ⭐ **Un valor ambiguo no se siembra.** El índice único de la tabla es
 * `(organización, tipo, valor normalizado)`: si dos clientes se llaman igual, el
 * segundo choca contra el primero. Sembrar "el primero que aparece" haría que
 * todas las llamadas de los dos fueran a parar a la ficha de uno solo, en
 * silencio. Se descartan **los dos** y el nombre queda sin sembrar: la llamada
 * va a pedir confirmación, que es la respuesta correcta cuando no se sabe.
 *
 * Devuelve también los valores descartados, para poder decirlo en pantalla en
 * vez de que la siembra "funcione" sembrando menos de lo que el usuario espera.
 */
export function buildIdentitySeeds(people: readonly SeedablePerson[]): {
  seeds: IdentitySeed[];
  ambiguous: { identityType: IdentityType; value: string; owners: number }[];
} {
  /** normalizado → candidatos. Más de uno = ambiguo. */
  const byKey = new Map<string, { seed: IdentitySeed; owner: string }[]>();

  function consider(
    person: SeedablePerson,
    identityType: IdentityType,
    raw: string | null | undefined
  ) {
    if (!person.clientId && !person.leadId) return;
    const value = raw?.trim();
    if (!value) return;

    const normalized =
      identityType === "email" ? normalizeEmail(value) : normalizeIdentity(value);
    // Un mail sin arroba o un nombre que se normaliza a nada no identifica a
    // nadie. Se descarta en vez de guardarse a medias.
    if (!normalized) return;

    const owner = person.clientId ?? person.leadId ?? "";
    const key = `${identityType}:${normalized}`;
    const list = byKey.get(key) ?? [];

    // La misma persona cargada dos veces (nombre y apodo iguales) no es
    // ambigüedad: es el mismo dueño.
    if (list.some((entry) => entry.owner === owner)) return;

    list.push({
      seed: {
        clientId: person.clientId,
        leadId: person.leadId,
        identityType,
        value,
        normalizedValue: normalized,
        source: "seed",
      },
      owner,
    });
    byKey.set(key, list);
  }

  for (const person of people) {
    consider(person, "email", person.email);
    consider(person, "name", person.name);
    consider(person, "name", person.nickname);
  }

  const seeds: IdentitySeed[] = [];
  const ambiguous: { identityType: IdentityType; value: string; owners: number }[] = [];

  for (const entries of byKey.values()) {
    const first = entries[0];
    if (!first) continue;

    if (entries.length > 1) {
      ambiguous.push({
        identityType: first.seed.identityType,
        value: first.seed.value,
        owners: entries.length,
      });
      continue;
    }
    seeds.push(first.seed);
  }

  return { seeds, ambiguous };
}
