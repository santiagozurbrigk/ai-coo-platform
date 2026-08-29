/**
 * lib/funnels — motor de embudos.
 *
 * Ver docs/FUNNELS_ARCHITECTURE.md §10 para el plan de fases.
 *
 * `resolve.ts` NO se re-exporta acá: hace IO contra Supabase y sólo se importa
 * desde Server Components y Server Actions. Si entrara por este barrel, un
 * Client Component que importe cualquier tipo se llevaría el cliente de base de
 * datos puesto.
 */

export * from "./spine";
export * from "./types";
export * from "./instrumentation";
export * from "./kpis";
export * from "./health-bands";
export * from "./templates";
export * from "./validate-template";
export * from "./sources";
export * from "./period";
export * from "./compute";
