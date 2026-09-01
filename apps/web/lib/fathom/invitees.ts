/**
 * Invitados de una reunión de Fathom.
 *
 * ⭐ **Por qué importa.** OTC decidía qué era una llamada leyendo el título, y el
 * 86% de los títulos reales son `"Impromptu Google Meet Meeting"`. La API viene
 * devolviendo desde siempre algo mucho mejor y el parser lo tiraba:
 * `calendar_invitees`, con el **mail** de cada invitado y si es **externo**.
 *
 * `calendar_invitees` está en la lista de campos obligatorios de la respuesta
 * (`docs/external-apis/fathom/api-reference/meetings/list-meetings.md`), así que
 * la clave siempre viene — pero **el array puede estar vacío**, que es
 * exactamente lo que pasa en una reunión sin evento de calendario. Vacío no es
 * lo mismo que "no hay externos": es "no sabemos", y se trata distinto.
 */

export type FathomInvitee = {
  name: string | null;
  email: string;
  emailDomain: string | null;
  isExternal: boolean;
};

function pickStr(obj: Record<string, unknown>, key: string): string | null {
  const value = obj[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/**
 * Normaliza un mail para comparar.
 *
 * Sólo minúsculas y trim. **No** se quitan puntos ni sufijos `+algo`: son
 * convenciones de Gmail, no del protocolo, y aplicarlas a dominios corporativos
 * uniría personas distintas.
 */
export function normalizeEmail(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  return trimmed.includes("@") ? trimmed : null;
}

export function parseFathomInvitees(raw: unknown): FathomInvitee[] {
  if (!Array.isArray(raw)) return [];

  const seen = new Set<string>();
  const invitees: FathomInvitee[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;

    const email = normalizeEmail(pickStr(obj, "email"));
    // Un invitado sin mail no sirve para identificar a nadie. Se descarta en vez
    // de guardarse a medias.
    if (!email || seen.has(email)) continue;
    seen.add(email);

    const domain =
      pickStr(obj, "email_domain")?.toLowerCase() ?? email.split("@")[1] ?? null;

    invitees.push({
      name: pickStr(obj, "name"),
      email,
      emailDomain: domain,
      // `is_external` es obligatorio en el schema. Si llegara ausente o con otro
      // tipo, `=== true` lo deja en false: preferimos no afirmar que alguien es
      // externo sin que la API lo diga.
      isExternal: obj.is_external === true,
    });
  }

  return invitees;
}

/**
 * Mails de todos los participantes.
 *
 * ⭐ **Todos, no sólo los que Fathom marca externos.** `is_external` se calcula
 * contra el dominio de la cuenta de Fathom: un closer con Gmail personal figura
 * como externo, y un lead con un dominio parecido al de la empresa figura como
 * interno. Para cruzar contra la agenda la referencia es el mail del turno, así
 * que conviene comparar contra el conjunto completo y dejar que el turno decida.
 */
export function allEmails(invitees: FathomInvitee[]): string[] {
  return invitees.map((i) => i.email);
}
