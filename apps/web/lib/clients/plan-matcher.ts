/**
 * Utilitario para hacer match automático entre texto libre (ej: columna "Producto / Plan"
 * de un Excel importado) y los planes creados en el sistema.
 *
 * Estrategia de matching (orden de prioridad):
 *  1. Exacto normalizado: el texto coincide exactamente con el nombre del plan
 *     (ignorando mayúsculas/minúsculas y acentos)
 *  2. Substring: el nombre del plan está contenido en el texto del Excel, o vice versa
 *     (captura "High Ticket 12 semanas" cuando el plan se llama "High Ticket")
 *
 * Exporta también `selectBestSystem`: si el plan matcheado tiene exactamente un sistema
 * de cuotas, lo devuelve automáticamente. Con varios sistemas queda null para que el
 * usuario lo asigne manualmente.
 */

export type PlanLike = {
  id: string;
  name: string;
  installmentSystems: Array<{ id: string }>;
};

// ─── Normalización ────────────────────────────────────────────────────────────

/**
 * Normaliza un string para comparación: minúsculas, sin acentos, sin caracteres
 * especiales, sin espacios redundantes.
 */
function normText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")   // quitar diacríticos (á→a, é→e, ñ→n, ü→u, …)
    .replace(/[^a-z0-9\s]/g, " ")       // caracteres especiales → espacio
    .replace(/\s+/g, " ")               // colapsar espacios múltiples
    .trim();
}

// ─── Match principal ──────────────────────────────────────────────────────────

/**
 * Intenta encontrar el plan que mejor coincide con `productText`.
 * Devuelve el plan o `null` si no hay match suficientemente claro.
 */
export function matchPlanByName(
  productText: string,
  plans: PlanLike[]
): PlanLike | null {
  if (!productText?.trim() || !plans.length) return null;

  const query = normText(productText);

  // 1. Coincidencia exacta normalizada
  const exact = plans.find((p) => normText(p.name) === query);
  if (exact) return exact;

  // 2. Substring bidireccional: el nombre del plan está contenido en el texto
  //    o el texto está contenido en el nombre del plan.
  //    Se exige mínimo 4 caracteres en la parte más corta para evitar falsos positivos.
  const substr = plans.find((p) => {
    const pNorm = normText(p.name);
    if (pNorm.length < 4 || query.length < 4) return false;
    return pNorm.includes(query) || query.includes(pNorm);
  });
  if (substr) return substr;

  return null;
}

// ─── Selección de sistema de cuotas ──────────────────────────────────────────

/**
 * Si el plan tiene exactamente un sistema de cuotas, lo devuelve automáticamente.
 * Si tiene 0 o más de 1, devuelve null (el usuario asigna manualmente).
 */
export function selectBestSystem(plan: PlanLike): string | null {
  return plan.installmentSystems.length === 1
    ? (plan.installmentSystems[0]?.id ?? null)
    : null;
}
