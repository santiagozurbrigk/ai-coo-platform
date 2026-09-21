/**
 * La facturación del **negocio del cliente**, mes a mes.
 *
 * ⚠️ No confundir con `client_payments`: eso es lo que el cliente **nos paga a
 * nosotros** y se mira en Cobros. Esto es lo que el cliente **gana con su
 * negocio**, que es la métrica de si el acompañamiento está funcionando.
 *
 * Lógica pura: no toca base ni red.
 */

export type RevenueCurrency = "USD" | "ARS";

export type ClientRevenueEntry = {
  id: string;
  clientId: string;
  amount: number;
  currency: RevenueCurrency;
  /** El mes, como `YYYY-MM-01`. */
  period: string;
  note: string | null;
  createdAt: string;
};

export type ClientRevenueRow = {
  id: string;
  client_id: string;
  amount: number | string | null;
  currency: string | null;
  period: string;
  note: string | null;
  created_at: string;
};

export function rowToRevenueEntry(row: ClientRevenueRow): ClientRevenueEntry {
  return {
    id: row.id,
    clientId: row.client_id,
    // Postgres devuelve `numeric` como string: sin el Number() acá, sumar dos
    // meses concatenaría los textos.
    amount: Number(row.amount ?? 0),
    currency: row.currency === "ARS" ? "ARS" : "USD",
    period: row.period.slice(0, 10),
    note: row.note,
    createdAt: row.created_at,
  };
}

/** Lo que la ficha y la tabla dicen del negocio de un cliente. */
export type RevenueSummary = {
  /** El registro más reciente. `null` si nunca se cargó ninguno. */
  latest: ClientRevenueEntry | null;
  /** El anterior al más reciente, para poder comparar. */
  previous: ClientRevenueEntry | null;
  /**
   * Variación contra el mes anterior **registrado**, en porcentaje entero.
   *
   * `null` cuando no se puede calcular: sin dato anterior, o cuando el anterior
   * era cero —de cero a cualquier cosa no es "infinito por ciento", es empezar—.
   */
  changePct: number | null;
  /** El más alto registrado. Sirve para decir "su mejor mes". */
  best: ClientRevenueEntry | null;
  /** Cuántos meses tiene cargados. */
  count: number;
};

const VACIO: RevenueSummary = {
  latest: null,
  previous: null,
  changePct: null,
  best: null,
  count: 0,
};

/**
 * El resumen de una lista de registros, venga en el orden que venga.
 *
 * ⭐ Ordena por período y no por fecha de carga: alguien puede cargar el mes de
 * marzo en septiembre, y eso no lo convierte en el dato más reciente.
 */
export function summarizeRevenue(
  entries: readonly ClientRevenueEntry[]
): RevenueSummary {
  if (entries.length === 0) return VACIO;

  const ordenadas = [...entries].sort((a, b) => b.period.localeCompare(a.period));
  const latest = ordenadas[0]!;
  const previous = ordenadas[1] ?? null;

  const changePct =
    previous && previous.amount > 0
      ? Math.round(((latest.amount - previous.amount) / previous.amount) * 100)
      : null;

  const best = [...entries].sort((a, b) => b.amount - a.amount)[0]!;

  return { latest, previous, changePct, best, count: entries.length };
}

/** Los últimos N meses, del más viejo al más nuevo, para dibujar una línea. */
export function revenueSeries(
  entries: readonly ClientRevenueEntry[],
  maxPoints = 12
): number[] {
  return [...entries]
    .sort((a, b) => a.period.localeCompare(b.period))
    .slice(-maxPoints)
    .map((entry) => entry.amount);
}

/**
 * El mes actual como `YYYY-MM-01`, que es lo que propone el formulario.
 *
 * Se arma con los números locales y no con `toISOString()`: en Buenos Aires, un
 * 1° de mes a las 21:00 en UTC ya es el día 2, y en los últimos días del mes el
 * ISO puede saltar al mes siguiente.
 */
export function currentPeriod(today: Date = new Date()): string {
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

/** Normaliza cualquier fecha del mes al primer día: lo que se guarda es el período. */
export function normalizePeriod(value: string): string | null {
  const match = value.trim().match(/^(\d{4})-(\d{2})/);
  if (!match) return null;
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return `${match[1]}-${match[2]}-01`;
}

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/** «septiembre 2026». Se parte la cadena a mano para no correr el mes por zona horaria. */
export function formatPeriod(period: string): string {
  const [year, month] = period.split("-");
  const index = Number(month) - 1;
  if (!year || Number.isNaN(index) || !MESES[index]) return period;
  return `${MESES[index]} ${year}`;
}

/**
 * «sep 2026» — la misma fecha, para una celda de tabla.
 *
 * ⭐ «septiembre 2026» abajo de un monto parte el renglón en dos y ensancha la
 * columna más que el número que importa. En la ficha, donde hay lugar, se
 * escribe entero.
 */
export function formatPeriodShort(period: string): string {
  const [year, month] = period.split("-");
  const index = Number(month) - 1;
  if (!year || Number.isNaN(index) || !MESES[index]) return period;
  return `${MESES[index]!.slice(0, 3)} ${year}`;
}

/** «$12.400». Sin decimales: la facturación de un negocio no se lee con centavos. */
export function formatRevenue(amount: number, currency: RevenueCurrency): string {
  const formatted = new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  return currency === "ARS" ? `$${formatted}` : `US$${formatted}`;
}
