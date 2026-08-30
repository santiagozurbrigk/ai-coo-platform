/**
 * lib/hyros/resolve-attribution.ts
 *
 * Traduce el reporte de atribución de Hyros a las medidas del embudo.
 *
 * Puro: se testea sin base ni red.
 *
 * ⭐ **LA REGLA QUE EL DOCUMENTO DECLARA NO NEGOCIABLE**
 *
 *   "label each figure with its source — [Meta] for platform-reported, [Hyros]
 *    for attributed. The two never match exactly, and a report that mixes them
 *    without labels is how bad decisions get made."
 *
 * De ahí sale la decisión central de este archivo: **el revenue y el spend de
 * Hyros son medidas propias, separadas de las de Whop y de Meta.** No se
 * fusionan ni se usan como respaldo una de otra. El ROAS by-source se calcula
 * con el revenue Y el cost de Hyros; el blended, con los de Whop y Meta. Que
 * den distinto es el punto, no un error a corregir.
 */

import type { HyrosAttributionRow } from "./client";

export type HyrosMeasures = {
  /** M05 — revenue atribuido por Hyros. NO es el revenue de Whop. */
  attributedRevenue: number | null;
  /** Spend según Hyros. Es el denominador correcto del ROAS by-source. */
  attributedSpend: number | null;
  /** M06 — leads atribuidos a fuentes pagas. */
  attributedLeads: number | null;
  /** M08 — visitantes nuevos de las páginas. */
  landingVisitors: number | null;
};

/**
 * Suma un campo a lo largo de las filas del reporte.
 *
 * ⭐ Devuelve `null` si **ninguna** fila trae el campo. Que Hyros no reporte
 * `revenue` para ninguna cuenta no significa que la atribución sea cero:
 * significa que no la sabemos. Si al menos una fila lo trae, las que no lo traen
 * cuentan como cero — ahí sí hay señal de que el campo existe y esa cuenta no
 * tuvo nada.
 */
export function sumAttributionField(
  rows: HyrosAttributionRow[],
  field: string
): number | null {
  let total = 0;
  let seen = false;

  for (const row of rows) {
    const value = row?.[field];
    if (typeof value === "number" && Number.isFinite(value)) {
      total += value;
      seen = true;
      continue;
    }
    // Hyros puede devolver números como texto según la configuración de moneda
    // (`"$1,200.50"`). Se limpian separadores y símbolos, pero **el resultado
    // tiene que seguir teniendo dígitos**: sin esta guarda, `"n/a"` quedaría
    // como cadena vacía y `Number("")` es `0` — un texto sin sentido se
    // convertiría en un cero real, que es exactamente lo que §9.1 prohíbe.
    if (typeof value === "string" && value.trim()) {
      const cleaned = value.replace(/[^0-9.-]/g, "");
      if (!/\d/.test(cleaned)) continue;
      const parsed = Number(cleaned);
      if (Number.isFinite(parsed)) {
        total += parsed;
        seen = true;
      }
    }
  }

  return seen ? total : null;
}

/**
 * Resuelve las cuatro medidas del reporte.
 *
 * Sin filas —error de red, cuota agotada, ninguna cuenta publicitaria
 * conectada— todo queda en `null`. Un cero de revenue atribuido diría que
 * ninguna venta vino de los anuncios, que es una afirmación fuerte y
 * probablemente falsa.
 */
export function resolveHyrosMeasures(rows: HyrosAttributionRow[]): HyrosMeasures {
  if (rows.length === 0) {
    return {
      attributedRevenue: null,
      attributedSpend: null,
      attributedLeads: null,
      landingVisitors: null,
    };
  }

  // `leads` es el total y `new_leads` sólo los nuevos. Para M06 interesa el
  // total atribuido; `new_leads` queda como respaldo si la cuenta no reporta
  // `leads`.
  const leads =
    sumAttributionField(rows, "leads") ?? sumAttributionField(rows, "new_leads");

  return {
    attributedRevenue: sumAttributionField(rows, "revenue"),
    attributedSpend: sumAttributionField(rows, "cost"),
    attributedLeads: leads,
    // `new_visits` y no `clicks`: un mismo visitante puede clickear varias
    // veces, así que `clicks` no responde "cuánta gente llegó a la página".
    landingVisitors: sumAttributionField(rows, "new_visits"),
  };
}
