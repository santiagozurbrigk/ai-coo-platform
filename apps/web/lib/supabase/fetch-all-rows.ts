/**
 * Lee todas las filas de una consulta, paginando con `.range()`.
 *
 * ⚠️ PostgREST (Supabase) devuelve como máximo 1000 filas por request aunque
 * se pida `.limit(5000)`, y no avisa: el resultado simplemente viene más corto.
 * Toda suma, conteo o listado "completo" hecho en JS sobre una tabla que crece
 * tiene que pasar por acá (o resolverse en SQL).
 *
 * `buildPage(from, to)` arma la consulta de una página. Tiene que llevar un
 * `.order()` estable (por ejemplo por `id`): sin orden las páginas se pisan.
 */
export const POSTGREST_MAX_ROWS = 1000;

type PageResult<T> = PromiseLike<{
  data: T[] | null;
  error: { message: string } | null;
}>;

export async function fetchAllRows<T>(
  buildPage: (from: number, to: number) => PageResult<T>,
  options: { pageSize?: number; maxRows?: number } = {}
): Promise<{ rows: T[]; truncated: boolean; error: string | null }> {
  const pageSize = Math.min(options.pageSize ?? POSTGREST_MAX_ROWS, POSTGREST_MAX_ROWS);
  const maxRows = options.maxRows ?? Number.POSITIVE_INFINITY;
  const rows: T[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await buildPage(from, from + pageSize - 1);
    if (error) return { rows, truncated: false, error: error.message };
    const page = data ?? [];
    rows.push(...page);
    if (rows.length > maxRows) {
      return { rows: rows.slice(0, maxRows), truncated: true, error: null };
    }
    if (page.length < pageSize) break;
  }

  return { rows, truncated: false, error: null };
}
