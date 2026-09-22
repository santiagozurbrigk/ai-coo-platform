import { describe, expect, it } from "vitest";
import { fetchAllRows } from "../fetch-all-rows";

/** Simula PostgREST: corta cada página en `cap` filas aunque se pidan más. */
function fakeTable(total: number, cap = 1000) {
  const rows = Array.from({ length: total }, (_, i) => ({ id: i }));
  const calls: Array<[number, number]> = [];
  const buildPage = (from: number, to: number) => {
    calls.push([from, to]);
    const end = Math.min(to + 1, from + cap);
    return Promise.resolve({ data: rows.slice(from, end), error: null });
  };
  return { buildPage, calls };
}

describe("fetchAllRows", () => {
  it("trae más de 1000 filas paginando", async () => {
    const { buildPage, calls } = fakeTable(2500);
    const result = await fetchAllRows(buildPage);
    expect(result.rows).toHaveLength(2500);
    expect(result.truncated).toBe(false);
    expect(calls).toEqual([[0, 999], [1000, 1999], [2000, 2999]]);
  });

  it("corta en maxRows y lo informa", async () => {
    const { buildPage } = fakeTable(2500);
    const result = await fetchAllRows(buildPage, { maxRows: 2000 });
    expect(result.rows).toHaveLength(2000);
    expect(result.truncated).toBe(true);
  });

  it("exactamente maxRows no es truncado", async () => {
    const { buildPage } = fakeTable(2000);
    const result = await fetchAllRows(buildPage, { maxRows: 2000 });
    expect(result.rows).toHaveLength(2000);
    expect(result.truncated).toBe(false);
  });

  it("devuelve el error sin inventar un resultado vacío como completo", async () => {
    const result = await fetchAllRows(() =>
      Promise.resolve({ data: null, error: { message: "boom" } })
    );
    expect(result.error).toBe("boom");
  });
});
