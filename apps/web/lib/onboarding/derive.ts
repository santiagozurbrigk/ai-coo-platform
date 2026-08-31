/**
 * Capa pura del onboarding: dados los hechos de la organización, decide qué
 * ítems están cumplidos y si el gate tiene que bloquear.
 *
 * No toca la base de datos a propósito. Todo lo que decide algo se testea acá
 * sin Supabase; `resolve.ts` sólo junta los hechos.
 */

import {
  ONBOARDING_ITEMS,
  type OnboardingItem,
  type OnboardingItemId,
} from "./items";

/** Señales crudas leídas de las tablas reales. Ninguna es un "paso completado". */
export type OnboardingFacts = {
  organization: {
    name: string | null;
    currency: string | null;
    timezone: string | null;
    industry: string | null;
    country: string | null;
  } | null;
  /** Hay una oferta activa marcada como principal (`products.is_core_offer`). */
  hasCoreOffer: boolean;
  /** Hay un avatar con `is_primary = true`. */
  hasPrimaryAvatar: boolean;
  /** Cuántas integraciones de datos están conectadas (cualquiera cuenta). */
  connectedSourceCount: number;
  /** `fullyBound`: embudos con **todos** sus pasos vinculados a una fuente. */
  funnels: { total: number; fullyBound: number };
  /** Filas en `metrics_snapshots` — el histórico importado a mano. */
  historicalSnapshotCount: number;
  /** Perfiles en la organización, founder incluido. */
  teamMemberCount: number;
  /** Documentos con `status = 'indexed'`. */
  indexedDocumentCount: number;
};

/** Lo único que se persiste, porque no se puede derivar de ningún lado. */
export type OnboardingPersistedState = {
  gateCompletedAt: string | null;
  dismissedItems: string[];
  toursSeen: string[];
};

export const EMPTY_PERSISTED_STATE: OnboardingPersistedState = {
  gateCompletedAt: null,
  dismissedItems: [],
  toursSeen: [],
};

/** Quién está mirando. Decide si el gate le aplica. */
export type OnboardingSubject = {
  role: string;
  /** `organizations.skip_onboarding` — la salida que maneja el super-admin. */
  skipOnboarding: boolean;
};

export type OnboardingItemState = OnboardingItem & {
  /** Derivado de los hechos, siempre. Nunca de una bandera guardada. */
  done: boolean;
  /** El usuario pidió no verlo más. Un ítem descartado puede seguir sin cumplirse. */
  dismissed: boolean;
};

export type OnboardingState = {
  items: OnboardingItemState[];
  gate: {
    /** Todos los ítems del gate están cumplidos **ahora**. */
    satisfied: boolean;
    /** El usuario ya pasó por el flujo alguna vez. */
    passed: boolean;
    /** Hay que mandarlo al gate antes de dejarlo entrar. */
    required: boolean;
    pendingItemIds: OnboardingItemId[];
  };
  checklist: {
    /** Ítems de nivel `checklist` que ni están hechos ni fueron descartados. */
    open: OnboardingItemState[];
    done: number;
    total: number;
    complete: boolean;
  };
  suggested: OnboardingItemState[];
};

/**
 * De los seis campos que pide el formulario, sólo tres deciden si el ítem está
 * cumplido: **nombre, moneda y zona horaria**.
 *
 * El criterio es el mismo que define el gate. Moneda y zona horaria no se
 * pueden corregir después sin dejar mal etiquetado lo ya cargado; industria,
 * país e idioma son contexto para el agente y degradan bien. Pedirlos en el
 * formulario está bien; bloquear por ellos, no.
 */
function hasBusinessIdentity(facts: OnboardingFacts): boolean {
  const org = facts.organization;
  if (!org) return false;
  return Boolean(
    org.name?.trim() && org.currency?.trim() && org.timezone?.trim()
  );
}

const RESOLVERS: Record<OnboardingItemId, (facts: OnboardingFacts) => boolean> = {
  business_identity: hasBusinessIdentity,
  core_offer: (f) => f.hasCoreOffer,
  primary_avatar: (f) => f.hasPrimaryAvatar,
  data_source: (f) => f.connectedSourceCount > 0,
  // Un embudo creado pero a medio vincular no cuenta: muestra huecos, no
  // números, y darlo por hecho esconde justo el trabajo que falta.
  first_funnel: (f) => f.funnels.fullyBound > 0,
  historical_import: (f) => f.historicalSnapshotCount > 0,
  // El founder ya cuenta como miembro, así que invitar a alguien es pasar de 1.
  team_invited: (f) => f.teamMemberCount > 1,
  knowledge_base: (f) => f.indexedDocumentCount > 0,
};

export function deriveOnboardingState(
  facts: OnboardingFacts,
  persisted: OnboardingPersistedState = EMPTY_PERSISTED_STATE,
  subject: OnboardingSubject = { role: "founder", skipOnboarding: false }
): OnboardingState {
  const dismissed = new Set(persisted.dismissedItems);

  const items: OnboardingItemState[] = ONBOARDING_ITEMS.map((item) => ({
    ...item,
    done: RESOLVERS[item.id](facts),
    // Un ítem no descartable ignora lo que haya quedado guardado: la lista de
    // descartes es entrada del usuario y el catálogo manda sobre ella.
    dismissed: item.dismissible && dismissed.has(item.id),
  }));

  const gateItems = items.filter((i) => i.tier === "gate");
  const satisfied = gateItems.every((i) => i.done);
  const passed = persisted.gateCompletedAt !== null;

  /*
   * Tres razones para no mandar a alguien al gate, y cada una cubre un caso real:
   *
   * - No es founder: un `operator` o `viewer` no tiene permiso sobre settings ni
   *   integraciones, así que el gate lo dejaría encerrado en una pantalla que no
   *   puede completar.
   * - `skip_onboarding`: la salida de emergencia del super-admin.
   * - Ya pasó, o ya está todo cargado: lo segundo es lo que evita arrastrar por
   *   el wizard a las organizaciones que existían antes de esta feature.
   *
   * Ojo con la asimetría entre `passed` y `satisfied`: el gate se cruza una vez
   * (`passed`), pero el checklist mira el estado de ahora. Si alguien borra su
   * única oferta, el ítem vuelve a abrirse en el checklist y **no** lo expulsa
   * de la aplicación a mitad de trabajo.
   */
  const required =
    subject.role === "founder" &&
    !subject.skipOnboarding &&
    !passed &&
    !satisfied;

  const checklistItems = items.filter((i) => i.tier === "checklist");
  const open = checklistItems.filter((i) => !i.done && !i.dismissed);

  return {
    items,
    gate: {
      satisfied,
      passed,
      required,
      pendingItemIds: gateItems.filter((i) => !i.done).map((i) => i.id),
    },
    checklist: {
      open,
      done: checklistItems.filter((i) => i.done).length,
      total: checklistItems.length,
      complete: open.length === 0,
    },
    suggested: items.filter((i) => i.tier === "suggested"),
  };
}

/** Hechos de una organización recién creada: nada cargado. */
export function emptyOnboardingFacts(): OnboardingFacts {
  return {
    organization: null,
    hasCoreOffer: false,
    hasPrimaryAvatar: false,
    connectedSourceCount: 0,
    funnels: { total: 0, fullyBound: 0 },
    historicalSnapshotCount: 0,
    teamMemberCount: 0,
    indexedDocumentCount: 0,
  };
}
