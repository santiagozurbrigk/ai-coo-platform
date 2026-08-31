/**
 * Junta los hechos de onboarding de una organización desde las tablas reales.
 *
 * Este archivo hace IO: sólo se importa desde Server Components y Server
 * Actions. La lógica que decide algo vive en `derive.ts`, que es pura y se
 * testea sin base de datos.
 *
 * Usa el admin client porque varias tablas de integraciones tienen la lectura
 * bloqueada por RLS (guardan secretos) — ver CLAUDE.md §6.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isFunnelTemplateId, requireFunnelTemplate } from "@/lib/funnels/templates";
import {
  deriveOnboardingState,
  emptyOnboardingFacts,
  EMPTY_PERSISTED_STATE,
  type OnboardingFacts,
  type OnboardingPersistedState,
  type OnboardingState,
  type OnboardingSubject,
} from "./derive";
import type { OnboardingItemId } from "./items";

type Admin = ReturnType<typeof createAdminClient>;

/**
 * Tablas que cuentan como "fuente de datos conectada". Cualquiera alcanza: cuál
 * corresponde depende del negocio, y exigir una en particular sería adivinar.
 *
 * `activeFilter` existe porque no todas se desconectan igual: algunas borran la
 * fila, otras la dejan marcada. Sin el filtro, una integración desconectada
 * seguiría contando.
 */
const DATA_SOURCE_TABLES: {
  table: string;
  activeFilter?: { column: string; value: unknown };
}[] = [
  { table: "zernio_integrations", activeFilter: { column: "is_active", value: true } },
  { table: "ghl_integrations" },
  { table: "calendly_integrations" },
  { table: "fathom_integrations", activeFilter: { column: "status", value: "connected" } },
  { table: "payment_integrations", activeFilter: { column: "is_active", value: true } },
];

/**
 * Cuenta filas sin traerlas. Devuelve 0 ante cualquier error —incluida una
 * tabla que todavía no existe en este entorno— porque un ítem de onboarding no
 * puede tumbar la request que lo muestra.
 */
async function countRows(
  admin: Admin,
  table: string,
  organizationId: string,
  filter?: { column: string; value: unknown }
): Promise<number> {
  let query = admin
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  if (filter) query = query.eq(filter.column, filter.value);

  const { count, error } = await query;
  if (error) {
    console.error(`[onboarding] contando ${table}:`, error.message);
    return 0;
  }
  return count ?? 0;
}

/**
 * Un embudo cuenta cuando **todos** sus pasos tienen fuente. Es el mismo ratio
 * que la grilla de `/funnels` ya muestra (`boundSteps / stepCount`), así que el
 * checklist y esa pantalla no pueden discrepar.
 */
async function resolveFunnelFacts(
  admin: Admin,
  organizationId: string
): Promise<OnboardingFacts["funnels"]> {
  const { data: instances, error } = await admin
    .from("funnel_instances")
    .select("id, template_id")
    .eq("organization_id", organizationId)
    .eq("is_active", true);

  if (error) {
    console.error("[onboarding] contando embudos:", error.message);
    return { total: 0, fullyBound: 0 };
  }

  const renderable = (instances ?? []).filter((row) =>
    isFunnelTemplateId(row.template_id as string)
  );
  if (renderable.length === 0) return { total: 0, fullyBound: 0 };

  const { data: bindings } = await admin
    .from("funnel_step_bindings")
    .select("funnel_instance_id")
    .eq("organization_id", organizationId);

  const boundByInstance = new Map<string, number>();
  for (const binding of bindings ?? []) {
    const key = binding.funnel_instance_id as string;
    boundByInstance.set(key, (boundByInstance.get(key) ?? 0) + 1);
  }

  const fullyBound = renderable.filter((row) => {
    const stepCount = requireFunnelTemplate(row.template_id as string).steps.length;
    return (boundByInstance.get(row.id as string) ?? 0) >= stepCount;
  }).length;

  return { total: renderable.length, fullyBound };
}

export async function resolveOnboardingFacts(
  organizationId: string
): Promise<OnboardingFacts> {
  if (!isSupabaseConfigured()) return emptyOnboardingFacts();

  const admin = createAdminClient();

  const [
    orgRes,
    coreOfferCount,
    primaryAvatarCount,
    sourceCounts,
    funnels,
    historicalSnapshotCount,
    teamMemberCount,
    indexedDocumentCount,
  ] = await Promise.all([
    admin
      .from("organizations")
      .select("name, currency, timezone, industry, country")
      .eq("id", organizationId)
      .maybeSingle(),
    countRows(admin, "products", organizationId, {
      column: "is_core_offer",
      value: true,
    }),
    countRows(admin, "customer_avatars", organizationId, {
      column: "is_primary",
      value: true,
    }),
    Promise.all(
      DATA_SOURCE_TABLES.map((source) =>
        countRows(admin, source.table, organizationId, source.activeFilter)
      )
    ),
    resolveFunnelFacts(admin, organizationId),
    countRows(admin, "metrics_snapshots", organizationId),
    countRows(admin, "profiles", organizationId),
    countRows(admin, "business_context_documents", organizationId, {
      column: "status",
      value: "indexed",
    }),
  ]);

  const org = orgRes.data;

  return {
    organization: org
      ? {
          name: (org.name as string | null) ?? null,
          currency: (org.currency as string | null) ?? null,
          timezone: (org.timezone as string | null) ?? null,
          industry: (org.industry as string | null) ?? null,
          country: (org.country as string | null) ?? null,
        }
      : null,
    // La oferta principal implica una oferta: no hace falta contar aparte.
    hasCoreOffer: coreOfferCount > 0,
    hasPrimaryAvatar: primaryAvatarCount > 0,
    connectedSourceCount: sourceCounts.filter((n) => n > 0).length,
    funnels,
    historicalSnapshotCount,
    teamMemberCount,
    indexedDocumentCount,
  };
}

export async function resolvePersistedOnboardingState(
  organizationId: string
): Promise<OnboardingPersistedState> {
  if (!isSupabaseConfigured()) return EMPTY_PERSISTED_STATE;

  const { data, error } = await createAdminClient()
    .from("onboarding_state")
    .select("gate_completed_at, dismissed_items, tours_seen")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error || !data) return EMPTY_PERSISTED_STATE;

  return {
    gateCompletedAt: (data.gate_completed_at as string | null) ?? null,
    dismissedItems: (data.dismissed_items as string[] | null) ?? [],
    toursSeen: (data.tours_seen as string[] | null) ?? [],
  };
}

/*
 * Cache de 60 segundos, con el mismo criterio que `getOrgContext`: el estado se
 * lee en cada carga del dashboard y cambia pocas veces por sesión. La ventana
 * es corta a propósito — tras completar un ítem hay que invalidar con
 * `invalidateOnboardingState`, y si esa llamada se olvidara, el peor caso es un
 * minuto de desfasaje en vez de un tilde que nunca aparece.
 *
 * Se cachean **los hechos, no el estado derivado**: la derivación depende de
 * quién mira (rol y `skip_onboarding`) y es pura y barata, así que meterla en
 * la clave sólo multiplicaría entradas y volvería la invalidación un barrido.
 */
const CACHE_TTL_MS = 60 * 1000;

type CachedFacts = {
  facts: OnboardingFacts;
  persisted: OnboardingPersistedState;
  cachedAt: number;
};

const factsCache = new Map<string, CachedFacts>();

export function invalidateOnboardingState(organizationId: string): void {
  factsCache.delete(organizationId);
}

export async function getOnboardingState(
  organizationId: string,
  subject: OnboardingSubject
): Promise<OnboardingState> {
  const cached = factsCache.get(organizationId);

  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return deriveOnboardingState(cached.facts, cached.persisted, subject);
  }

  const [facts, persisted] = await Promise.all([
    resolveOnboardingFacts(organizationId),
    resolvePersistedOnboardingState(organizationId),
  ]);

  factsCache.set(organizationId, { facts, persisted, cachedAt: Date.now() });
  return deriveOnboardingState(facts, persisted, subject);
}

/** Marca el gate como cruzado. Idempotente. */
export async function markGateCompleted(organizationId: string): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await createAdminClient()
    .from("onboarding_state")
    .upsert(
      { organization_id: organizationId, gate_completed_at: now, updated_at: now },
      { onConflict: "organization_id" }
    );

  if (error) throw new Error(error.message);
  invalidateOnboardingState(organizationId);
}

/** Agrega un ítem a los descartados sin pisar los que ya estaban. */
export async function dismissOnboardingItem(
  organizationId: string,
  itemId: OnboardingItemId
): Promise<void> {
  const admin = createAdminClient();
  const current = await resolvePersistedOnboardingState(organizationId);
  if (current.dismissedItems.includes(itemId)) return;

  const now = new Date().toISOString();
  const { error } = await admin.from("onboarding_state").upsert(
    {
      organization_id: organizationId,
      dismissed_items: [...current.dismissedItems, itemId],
      updated_at: now,
    },
    { onConflict: "organization_id" }
  );

  if (error) throw new Error(error.message);
  invalidateOnboardingState(organizationId);
}
