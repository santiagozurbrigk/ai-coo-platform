import { isFunnelTemplateId, requireFunnelTemplate } from "@/lib/funnels/templates";
import {
  deriveOnboardingState,
  type OnboardingFacts,
  type OnboardingState,
} from "@/lib/onboarding/derive";

/**
 * Mapeo puro de las filas de `onboarding_org_progress()`.
 *
 * Separado del acceso a datos para que se pueda testear sin Supabase, igual
 * que el resto de los `mapper` del repo.
 */

/** Una fila cruda de `onboarding_org_progress()`. */
export type OrgProgressRow = {
  organization_id: string;
  organization_name: string;
  account_type: string | null;
  org_status: string | null;
  skip_onboarding: boolean;
  created_at: string;
  currency: string | null;
  timezone: string | null;
  industry: string | null;
  country: string | null;
  founder_email: string | null;
  member_count: number;
  has_core_offer: boolean;
  has_primary_avatar: boolean;
  connected_source_count: number;
  funnels: { templateId: string; bound: number }[] | null;
  historical_snapshot_count: number;
  indexed_document_count: number;
  gate_completed_at: string | null;
  dismissed_items: string[] | null;
  tours_seen: string[] | null;
};

export type OrgOnboardingProgress = {
  organizationId: string;
  organizationName: string;
  founderEmail: string | null;
  accountType: string | null;
  orgStatus: string | null;
  memberCount: number;
  createdAt: string;
  /** Días desde que se creó la organización. */
  ageInDays: number;
  /**
   * Si este onboarding le aplica a la organización.
   *
   * Un holding tiene el suyo propio —otro wizard, otra tabla— y una org con
   * `skip_onboarding` fue excusada a mano por el super-admin. Mostrarles un
   * checklist de embudos e histórico sería medir lo que no corresponde, y
   * peor: las pondría arriba de todo en una lista que responde \"quién se
   * trabó\".
   */
  applies: boolean;
  state: OnboardingState;
  toursSeen: string[];
};

/**
 * Cuántos embudos tienen **todos** sus pasos vinculados.
 *
 * El conteo de pasos por plantilla vive en el código, no en la base, así que la
 * función SQL devuelve el detalle crudo y la resolución pasa por acá — la misma
 * fuente de verdad que usa la grilla de `/funnels`.
 */
function resolveFunnels(
  rows: OrgProgressRow["funnels"]
): OnboardingFacts["funnels"] {
  const renderable = (rows ?? []).filter((f) => isFunnelTemplateId(f.templateId));

  return {
    total: renderable.length,
    fullyBound: renderable.filter(
      (f) => f.bound >= requireFunnelTemplate(f.templateId).steps.length
    ).length,
  };
}

export function factsFromRow(row: OrgProgressRow): OnboardingFacts {
  return {
    organization: {
      name: row.organization_name,
      currency: row.currency,
      timezone: row.timezone,
      industry: row.industry,
      country: row.country,
    },
    hasCoreOffer: row.has_core_offer,
    hasPrimaryAvatar: row.has_primary_avatar,
    connectedSourceCount: row.connected_source_count,
    funnels: resolveFunnels(row.funnels),
    historicalSnapshotCount: row.historical_snapshot_count,
    teamMemberCount: row.member_count,
    indexedDocumentCount: row.indexed_document_count,
  };
}

function daysSince(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

export function progressFromRow(row: OrgProgressRow): OrgOnboardingProgress {
  /*
   * El estado se deriva con la MISMA función pura que usa la aplicación. El
   * panel no puede tener su propia idea de qué está completo: si divergiera,
   * mostraría un progreso que el cliente no ve en su pantalla.
   *
   * El sujeto se arma como si fuera el founder de esa organización, que es el
   * único que pasa por el gate.
   */
  const applies = row.account_type !== "holding" && !row.skip_onboarding;

  return {
    organizationId: row.organization_id,
    organizationName: row.organization_name,
    applies,
    founderEmail: row.founder_email,
    accountType: row.account_type,
    orgStatus: row.org_status,
    memberCount: row.member_count,
    createdAt: row.created_at,
    ageInDays: daysSince(row.created_at),
    state: deriveOnboardingState(
      factsFromRow(row),
      {
        gateCompletedAt: row.gate_completed_at,
        dismissedItems: row.dismissed_items ?? [],
        toursSeen: row.tours_seen ?? [],
      },
      {
        role: "founder",
        skipOnboarding: row.skip_onboarding,
        accountType: row.account_type,
      }
    ),
    toursSeen: row.tours_seen ?? [],
  };
}

/**
 * Ordena por "quién necesita atención primero".
 *
 * El criterio no es el progreso a secas: una organización creada hoy con todo
 * pendiente es normal, y una de hace tres semanas en el mismo estado es un
 * cliente trabado. Por eso el gate pendiente manda, y a igual estado gana la
 * más vieja.
 *
 * Las organizaciones a las que este onboarding no les aplica van al final, sin
 * importar su progreso: si no, cuatro holdings con el checklist en cero
 * encabezarían la lista y taparían a los clientes que sí están trabados.
 */
export function sortByNeedsAttention(
  a: OrgOnboardingProgress,
  b: OrgOnboardingProgress
): number {
  if (a.applies !== b.applies) return a.applies ? -1 : 1;

  const gateA = a.state.gate.required ? 0 : 1;
  const gateB = b.state.gate.required ? 0 : 1;
  if (gateA !== gateB) return gateA - gateB;

  const openA = a.state.checklist.open.length;
  const openB = b.state.checklist.open.length;
  if (openA !== openB) return openB - openA;

  return b.ageInDays - a.ageInDays;
}

