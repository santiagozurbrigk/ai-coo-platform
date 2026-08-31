/**
 * Capa pura del onboarding.
 *
 * El grupo que más importa es "derivar, no guardar": el progreso tiene que
 * salir de los datos reales, así que una org que ya tenía todo cargado aparece
 * completa sin haber pasado nunca por el wizard, y borrar un dato reabre su
 * ítem. Ver docs/ONBOARDING_PLAN.md §3.
 */

import { describe, it, expect } from "vitest";
import {
  applyLocalDismissals,
  deriveOnboardingState,
  firstPendingGateStep,
  emptyOnboardingFacts,
  EMPTY_PERSISTED_STATE,
  type OnboardingFacts,
  type OnboardingPersistedState,
} from "../derive";
import { ONBOARDING_ITEMS } from "../items";

/** Una org con absolutamente todo configurado. */
function completeFacts(): OnboardingFacts {
  return {
    organization: {
      name: "Acme",
      currency: "USD",
      timezone: "America/Argentina/Buenos_Aires",
      industry: "Infoproductos",
      country: "AR",
    },
    hasCoreOffer: true,
    hasPrimaryAvatar: true,
    connectedSourceCount: 2,
    funnels: { total: 1, fullyBound: 1 },
    historicalSnapshotCount: 3,
    teamMemberCount: 4,
    indexedDocumentCount: 5,
  };
}

function persisted(
  patch: Partial<OnboardingPersistedState> = {}
): OnboardingPersistedState {
  return { ...EMPTY_PERSISTED_STATE, ...patch };
}

const FOUNDER = { role: "founder", skipOnboarding: false };

describe("deriveOnboardingState — org recién creada", () => {
  const state = deriveOnboardingState(emptyOnboardingFacts());

  it("no da ningún ítem por cumplido", () => {
    expect(state.items.every((i) => !i.done)).toBe(true);
  });

  it("manda al gate y lista los tres pasos pendientes", () => {
    expect(state.gate.required).toBe(true);
    expect(state.gate.satisfied).toBe(false);
    expect(state.gate.pendingItemIds).toEqual([
      "business_identity",
      "core_offer",
      "primary_avatar",
    ]);
  });

  it("deja todo el checklist abierto", () => {
    expect(state.checklist.done).toBe(0);
    expect(state.checklist.complete).toBe(false);
    expect(state.checklist.open).toHaveLength(state.checklist.total);
  });
});

describe("deriveOnboardingState — org que ya tenía todo cargado", () => {
  /*
   * El caso que rompe un `onboarding_progress` con booleanos: nadie pasó por el
   * wizard —`gateCompletedAt` sigue en null— y aun así todo está cumplido.
   */
  const state = deriveOnboardingState(completeFacts(), persisted(), FOUNDER);

  it("marca todo como cumplido sin haber pasado por el wizard", () => {
    expect(state.gate.passed).toBe(false);
    expect(state.items.every((i) => i.done)).toBe(true);
  });

  it("no la arrastra al gate: ya está satisfecho por los datos", () => {
    expect(state.gate.satisfied).toBe(true);
    expect(state.gate.required).toBe(false);
  });

  it("cierra el checklist", () => {
    expect(state.checklist.complete).toBe(true);
    expect(state.checklist.open).toHaveLength(0);
  });
});

describe("business_identity — qué campos deciden", () => {
  function identity(org: Partial<NonNullable<OnboardingFacts["organization"]>>) {
    const facts = emptyOnboardingFacts();
    facts.organization = {
      name: null,
      currency: null,
      timezone: null,
      industry: null,
      country: null,
      ...org,
    };
    return deriveOnboardingState(facts).items.find(
      (i) => i.id === "business_identity"
    )!.done;
  }

  it("se cumple con nombre, moneda y zona horaria", () => {
    expect(identity({ name: "Acme", currency: "USD", timezone: "UTC" })).toBe(true);
  });

  it("no se cumple sin moneda — es el dato con costo retroactivo", () => {
    expect(identity({ name: "Acme", currency: null, timezone: "UTC" })).toBe(false);
  });

  it("no se cumple sin zona horaria", () => {
    expect(identity({ name: "Acme", currency: "USD", timezone: null })).toBe(false);
  });

  it("no bloquea por industria ni país: son contexto, no unidades", () => {
    expect(
      identity({
        name: "Acme",
        currency: "USD",
        timezone: "UTC",
        industry: null,
        country: null,
      })
    ).toBe(true);
  });

  it("trata el string vacío como faltante", () => {
    expect(identity({ name: "  ", currency: "USD", timezone: "UTC" })).toBe(false);
  });
});

describe("gate — a quién le aplica", () => {
  it("no aplica a un usuario invitado: no podría completarlo", () => {
    // Un operator no tiene permiso sobre settings ni integraciones, así que el
    // gate lo dejaría encerrado en una pantalla que no puede resolver.
    const state = deriveOnboardingState(emptyOnboardingFacts(), persisted(), {
      role: "operator",
      skipOnboarding: false,
    });
    expect(state.gate.required).toBe(false);
    expect(state.gate.satisfied).toBe(false);
  });

  it("no aplica con skip_onboarding — la salida del super-admin", () => {
    const state = deriveOnboardingState(emptyOnboardingFacts(), persisted(), {
      role: "founder",
      skipOnboarding: true,
    });
    expect(state.gate.required).toBe(false);
  });

  it("no vuelve a pedirlo si el founder ya lo cruzó", () => {
    const state = deriveOnboardingState(emptyOnboardingFacts(), persisted({
      gateCompletedAt: "2026-08-31T12:00:00.000Z",
    }), FOUNDER);
    expect(state.gate.passed).toBe(true);
    expect(state.gate.required).toBe(false);
  });

  it("no expulsa a quien borró un dato del gate después de cruzarlo", () => {
    /*
     * La asimetría entre `passed` y `satisfied`: el ítem se reabre en el
     * checklist, pero nadie queda encerrado a mitad de trabajo.
     */
    const facts = completeFacts();
    facts.hasCoreOffer = false;

    const state = deriveOnboardingState(facts, persisted({
      gateCompletedAt: "2026-08-31T12:00:00.000Z",
    }), FOUNDER);

    expect(state.gate.satisfied).toBe(false);
    expect(state.gate.required).toBe(false);
    expect(state.items.find((i) => i.id === "core_offer")!.done).toBe(false);
  });
});

describe("ítems del checklist", () => {
  it("un embudo a medio vincular no cuenta", () => {
    const facts = emptyOnboardingFacts();
    facts.funnels = { total: 2, fullyBound: 0 };
    const item = deriveOnboardingState(facts).items.find(
      (i) => i.id === "first_funnel"
    )!;
    expect(item.done).toBe(false);
  });

  it("alcanza con una sola fuente conectada, cualquiera", () => {
    const facts = emptyOnboardingFacts();
    facts.connectedSourceCount = 1;
    expect(
      deriveOnboardingState(facts).items.find((i) => i.id === "data_source")!.done
    ).toBe(true);
  });

  it("el founder solo no cuenta como equipo invitado", () => {
    const facts = emptyOnboardingFacts();
    facts.teamMemberCount = 1;
    expect(
      deriveOnboardingState(facts).items.find((i) => i.id === "team_invited")!.done
    ).toBe(false);

    facts.teamMemberCount = 2;
    expect(
      deriveOnboardingState(facts).items.find((i) => i.id === "team_invited")!.done
    ).toBe(true);
  });
});

describe("descartes", () => {
  it("saca del checklist un ítem descartado sin darlo por cumplido", () => {
    const state = deriveOnboardingState(
      emptyOnboardingFacts(),
      persisted({ dismissedItems: ["historical_import"] }),
      FOUNDER
    );

    const item = state.items.find((i) => i.id === "historical_import")!;
    expect(item.dismissed).toBe(true);
    expect(item.done).toBe(false);
    expect(state.checklist.open.map((i) => i.id)).not.toContain("historical_import");
    // Descartar no es completar: no suma al contador.
    expect(state.checklist.done).toBe(0);
  });

  it("ignora un descarte guardado sobre un ítem del gate", () => {
    // El catálogo manda sobre la lista de descartes, que es entrada del usuario.
    const state = deriveOnboardingState(
      emptyOnboardingFacts(),
      persisted({ dismissedItems: ["core_offer"] }),
      FOUNDER
    );
    expect(state.items.find((i) => i.id === "core_offer")!.dismissed).toBe(false);
    expect(state.gate.pendingItemIds).toContain("core_offer");
  });

  it("ignora ids desconocidos que hayan quedado guardados", () => {
    const state = deriveOnboardingState(
      emptyOnboardingFacts(),
      persisted({ dismissedItems: ["item_que_ya_no_existe"] }),
      FOUNDER
    );
    expect(state.items.some((i) => i.dismissed)).toBe(false);
  });
});

describe("catálogo", () => {
  it("no tiene ids duplicados", () => {
    const ids = ONBOARDING_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("ningún ítem del gate es descartable", () => {
    const gate = ONBOARDING_ITEMS.filter((i) => i.tier === "gate");
    expect(gate.length).toBeGreaterThan(0);
    expect(gate.every((i) => !i.dismissible)).toBe(true);
  });

  it("todo ítem apunta a una ruta de la plataforma", () => {
    expect(ONBOARDING_ITEMS.every((i) => i.href.startsWith("/"))).toBe(true);
  });

  it("todo ítem del catálogo tiene resolver: ninguno queda sin evaluar", () => {
    // Si alguien agrega un ítem y olvida su resolver, `done` sería undefined y
    // el ítem se mostraría abierto para siempre sin que nada falle.
    const state = deriveOnboardingState(completeFacts());
    expect(state.items).toHaveLength(ONBOARDING_ITEMS.length);
    expect(state.items.every((i) => typeof i.done === "boolean")).toBe(true);
  });
});

describe("firstPendingGateStep", () => {
  it("arranca en el primer paso cuando no hay nada cargado", () => {
    expect(firstPendingGateStep(deriveOnboardingState(emptyOnboardingFacts()))).toBe(0);
  });

  it("saltea la identidad si la org ya la tiene", () => {
    const facts = emptyOnboardingFacts();
    facts.organization = {
      name: "Acme",
      currency: "USD",
      timezone: "UTC",
      industry: null,
      country: null,
    };
    expect(firstPendingGateStep(deriveOnboardingState(facts))).toBe(1);
  });

  it("va al avatar si sólo falta ese", () => {
    const facts = completeFacts();
    facts.hasPrimaryAvatar = false;
    expect(firstPendingGateStep(deriveOnboardingState(facts))).toBe(2);
  });

  it("no devuelve -1 cuando no queda nada pendiente", () => {
    // El gate no debería mostrarse en ese estado, pero un índice negativo
    // rompería el wizard en silencio.
    expect(firstPendingGateStep(deriveOnboardingState(completeFacts()))).toBe(2);
  });
});

describe("applyLocalDismissals", () => {
  const base = deriveOnboardingState(emptyOnboardingFacts(), persisted(), FOUNDER);

  it("devuelve el mismo estado cuando no hay descartes", () => {
    expect(applyLocalDismissals(base, [])).toBe(base);
  });

  it("saca el ítem de los abiertos sin marcarlo como hecho", () => {
    const next = applyLocalDismissals(base, ["team_invited"]);
    const item = next.items.find((i) => i.id === "team_invited")!;

    expect(item.dismissed).toBe(true);
    expect(item.done).toBe(false);
    expect(next.checklist.open.map((i) => i.id)).not.toContain("team_invited");
  });

  it("cierra el checklist cuando se descarta lo último que quedaba", () => {
    // Es lo que decide si la tarjeta y el contador siguen visibles: marcar el
    // ítem sin recalcular `open` los dejaría colgados en pantalla.
    const ids = base.checklist.open.map((i) => i.id);
    const next = applyLocalDismissals(base, ids);

    expect(next.checklist.open).toHaveLength(0);
    expect(next.checklist.complete).toBe(true);
  });

  it("ignora el pedido sobre un ítem del gate", () => {
    const next = applyLocalDismissals(base, ["core_offer"]);
    expect(next.items.find((i) => i.id === "core_offer")!.dismissed).toBe(false);
  });

  it("no muta el estado original", () => {
    applyLocalDismissals(base, ["team_invited"]);
    expect(base.items.find((i) => i.id === "team_invited")!.dismissed).toBe(false);
  });
});
