/**
 * lib/hyros/attribution.ts
 *
 * Trae el reporte de atribución de un período, con caché.
 *
 * Mismo criterio que VTurb y por los mismos dos motivos: el reporte se pide por
 * rango exacto y varias de sus métricas no se pueden sumar entre días, y Hyros
 * limita a 30 req/segundo y 1000 por minuto — una consulta de atribución recorre
 * todas las fuentes de una cuenta publicitaria.
 *
 * ⭐ **El modelo de atribución forma parte de la llave de caché.** `last_click`,
 * `first_click` y `scientific` dan números distintos para el mismo período: son
 * respuestas a preguntas distintas, no versiones de la misma. Compartir caché
 * entre ellos mostraría el número de un modelo bajo la etiqueta de otro.
 *
 * Sólo servidor.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import {
  getHyrosAdAccountAttribution,
  HyrosApiError,
  type HyrosAttributionRow,
} from "./client";
import { getHyrosCredentialsForOrg } from "./integration";
import { resolveHyrosMeasures, type HyrosMeasures } from "./resolve-attribution";

/** Cuánto vale el reporte de un período todavía abierto. */
const OPEN_PERIOD_TTL_MS = 60 * 60 * 1000;

export type HyrosPeriodResult = HyrosMeasures & {
  fromCache: boolean;
  error: string | null;
};

const EMPTY: HyrosMeasures = {
  attributedRevenue: null,
  attributedSpend: null,
  attributedLeads: null,
  landingVisitors: null,
};

function isClosedPeriod(endDate: string, today = new Date().toISOString().slice(0, 10)) {
  return endDate < today;
}

function isFresh(fetchedAt: string, isFinal: boolean, now: number): boolean {
  if (isFinal) return true;
  const at = Date.parse(fetchedAt);
  return Number.isFinite(at) && now - at < OPEN_PERIOD_TTL_MS;
}

function describeError(error: unknown): string {
  if (error instanceof HyrosApiError) {
    return error.retryAfter
      ? `${error.message} (cuota agotada, reintentar en ${error.retryAfter}s)`
      : error.message;
  }
  return error instanceof Error ? error.message : "Error desconocido";
}

/**
 * Medidas de atribución de Hyros para el período.
 *
 * Devuelve todo en `null` si la org no tiene Hyros, si no hay ninguna cuenta
 * publicitaria sincronizada, o si la API falla. Ninguno de esos casos es un cero:
 * decir que el revenue atribuido fue cero afirmaría que ninguna venta vino de
 * los anuncios.
 */
export async function getHyrosPeriodMeasures(
  organizationId: string,
  startDate: string,
  endDate: string
): Promise<HyrosPeriodResult> {
  const admin = createAdminClient();
  const now = Date.now();

  const credentials = await getHyrosCredentialsForOrg(organizationId);
  if (!credentials) return { ...EMPTY, fromCache: false, error: "Hyros no está conectado" };

  const model = credentials.attributionModel;

  const { data: cached } = await admin
    .from("hyros_attribution_cache")
    .select("payload, is_final, fetched_at, error_message")
    .eq("organization_id", organizationId)
    .eq("start_date", startDate)
    .eq("end_date", endDate)
    .eq("attribution_model", model)
    .maybeSingle();

  if (cached && isFresh(cached.fetched_at as string, Boolean(cached.is_final), now)) {
    return {
      ...resolveHyrosMeasures((cached.payload ?? []) as HyrosAttributionRow[]),
      fromCache: true,
      error: (cached.error_message as string | null) ?? null,
    };
  }

  // El reporte exige nombrar las cuentas: no se puede pedir "todo".
  const { data: accounts } = await admin
    .from("hyros_ad_accounts")
    .select("external_id")
    .eq("organization_id", organizationId)
    .eq("is_active", true);

  if (!accounts?.length) {
    return {
      ...EMPTY,
      fromCache: false,
      error: "No hay cuentas publicitarias de Hyros sincronizadas",
    };
  }

  const rows: HyrosAttributionRow[] = [];
  let errorMessage: string | null = null;

  for (const account of accounts) {
    try {
      const result = await getHyrosAdAccountAttribution(credentials, {
        adAccountId: account.external_id as string,
        startDate,
        endDate,
        attributionModel: model,
      });
      rows.push(...result);
    } catch (error) {
      // Una cuenta que falla no invalida las demás, pero el total pasa a ser
      // parcial: el error queda registrado y se muestra.
      errorMessage = describeError(error);
    }
  }

  await admin.from("hyros_attribution_cache").upsert(
    {
      organization_id: organizationId,
      start_date: startDate,
      end_date: endDate,
      attribution_model: model,
      payload: rows,
      is_final: isClosedPeriod(endDate) && errorMessage === null && rows.length > 0,
      error_message: errorMessage,
      fetched_at: new Date().toISOString(),
    },
    { onConflict: "organization_id,start_date,end_date,attribution_model" }
  );

  return {
    ...resolveHyrosMeasures(rows),
    fromCache: false,
    error: errorMessage,
  };
}
