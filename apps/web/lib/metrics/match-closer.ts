/**
 * ⭐ Quién cerró una venta: la regla que decide a quién se le paga la comisión.
 *
 * Esto no es una etiqueta, es plata. Y hasta ahora había **dos reglas
 * distintas** para el mismo cálculo: una comparaba nombres exactos y la otra
 * hacía `incluye`, así que con un "Juan Pérez" en el equipo, cualquier closer
 * llamado Juan —Juan Gómez, Juan Martínez— le sumaba comisiones a esa fila. El
 * mismo mes daba dos números según qué pantalla lo mostraba.
 *
 * Las tres reglas de acá:
 *
 *   1. **Si los dos tienen id, manda el id.** Es el único cruce que no se rompe
 *      cuando alguien escribe el nombre distinto.
 *   2. **Si no, el nombre tiene que coincidir entero**, normalizado: sin
 *      espacios de más, sin mayúsculas y sin acentos. "Juan Pérez" y "juan
 *      perez" son la misma persona; "Juan Pérez" y "Juan" no.
 *   3. **Ante la duda, no cuenta.** Un nombre vacío no matchea nunca — ni
 *      contra otro vacío.
 *
 * Lógica pura: no toca base ni red.
 */

export type CommissionMember = {
  /** Id del miembro en la plataforma, cuando la fila lo tiene vinculado. */
  memberId?: string | null;
  memberName: string;
};

export type ClosedDeal = {
  /** Id de quien cerró, cuando la llamada lo trae. */
  closerId?: string | null;
  closerName?: string | null;
};

/**
 * Normaliza para comparar: sin espacios de más, en minúsculas y sin acentos.
 *
 * Los acentos importan de verdad acá: "Juan Pérez" tipeado sin acento en el
 * módulo de llamadas y con acento en compensación es la misma persona, y sin
 * esto la comisión daba cero **en silencio**.
 */
export function normalizePersonName(name: string | null | undefined): string {
  return (name ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function matchesCloser(member: CommissionMember, deal: ClosedDeal): boolean {
  // 1 · El id manda cuando los dos lo tienen.
  const memberId = member.memberId?.trim();
  const closerId = deal.closerId?.trim();
  if (memberId && closerId) return memberId === closerId;

  // 2 y 3 · Nombre completo normalizado, y nunca contra vacío.
  const memberKey = normalizePersonName(member.memberName);
  const closerKey = normalizePersonName(deal.closerName);
  if (!memberKey || !closerKey) return false;

  return memberKey === closerKey;
}

/** Las ventas de un miembro dentro de un conjunto ya filtrado por período. */
export function dealsOfMember<T extends ClosedDeal>(
  member: CommissionMember,
  deals: readonly T[]
): T[] {
  return deals.filter((deal) => matchesCloser(member, deal));
}
