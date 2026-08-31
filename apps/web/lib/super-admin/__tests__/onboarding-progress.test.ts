/**
 * Panel de onboarding de super-admin.
 *
 * Lo que se testea acá es el mapeo y el orden. La decisión de qué está completo
 * NO se re-implementa: el panel llama a la misma `deriveOnboardingState` que la
 * aplicación, justamente para que no pueda mostrar un progreso distinto del que
 * el cliente ve en su pantalla.
 */

import { describe, it, expect } from "vitest";
import {
  factsFromRow,
  progressFromRow,
  sortByNeedsAttention,
  type OrgProgressRow,
} from "../onboarding-progress-mapper";

function row(patch: Partial<OrgProgressRow> = {}): OrgProgressRow {
  return {
    organization_id: "org-1",
    organization_name: "Acme",
    account_type: "founder",
    org_status: "active",
    skip_onboarding: false,
    created_at: new Date().toISOString(),
    currency: "USD",
    timezone: "UTC",
    industry: null,
    country: null,
    founder_email: "founder@acme.co",
    member_count: 1,
    has_core_offer: false,
    has_primary_avatar: false,
    connected_source_count: 0,
    funnels: [],
    historical_snapshot_count: 0,
    indexed_document_count: 0,
    gate_completed_at: null,
    dismissed_items: [],
    tours_seen: [],
    ...patch,
  };
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

describe("factsFromRow — embudos", () => {
  it("cuenta como completo un embudo con todos sus pasos vinculados", () => {
    // La plantilla `webinar` tiene 7 pasos.
    const facts = factsFromRow(
      row({ funnels: [{ templateId: "webinar", bound: 7 }] })
    );
    expect(facts.funnels).toEqual({ total: 1, fullyBound: 1 });
  });

  it("no cuenta uno a medio vincular", () => {
    const facts = factsFromRow(
      row({ funnels: [{ templateId: "webinar", bound: 1 }] })
    );
    expect(facts.funnels).toEqual({ total: 1, fullyBound: 0 });
  });

  it("ignora una plantilla que ya no existe en el código", () => {
    // Una instancia vieja de un tipo de embudo retirado no puede tumbar el
    // panel entero de super-admin.
    const facts = factsFromRow(
      row({ funnels: [{ templateId: "tipo_retirado", bound: 99 }] })
    );
    expect(facts.funnels).toEqual({ total: 0, fullyBound: 0 });
  });

  it("tolera null", () => {
    expect(factsFromRow(row({ funnels: null })).funnels).toEqual({
      total: 0,
      fullyBound: 0,
    });
  });
});

describe("progressFromRow", () => {
  it("marca el gate como pendiente en una org sin configurar", () => {
    expect(progressFromRow(row()).state.gate.required).toBe(true);
  });

  it("no lo marca si ya lo cruzó", () => {
    const p = progressFromRow(row({ gate_completed_at: daysAgo(1) }));
    expect(p.state.gate.required).toBe(false);
    expect(p.state.gate.passed).toBe(true);
  });

  it("no marca como trabado a un holding sin fila de estado", () => {
    // Un holding nuevo no tiene `gate_completed_at` y tiene todo en cero, pero
    // su onboarding es otro: sin esta regla encabezaría la lista de trabados.
    const p = progressFromRow(
      row({ account_type: "holding", gate_completed_at: null })
    );
    expect(p.state.gate.required).toBe(false);
  });

  it("respeta skip_onboarding", () => {
    expect(progressFromRow(row({ skip_onboarding: true })).state.gate.required).toBe(
      false
    );
  });

  it("calcula la antigüedad en días", () => {
    expect(progressFromRow(row({ created_at: daysAgo(12) })).ageInDays).toBe(12);
  });

  it("nunca devuelve una antigüedad negativa", () => {
    // Un created_at en el futuro por desfasaje de reloj no debería mostrarse
    // como "-1 días".
    expect(
      progressFromRow(row({ created_at: daysAgo(-5) })).ageInDays
    ).toBe(0);
  });
});

describe("sortByNeedsAttention", () => {
  const trabada = progressFromRow(row({ organization_id: "trabada" }));
  const alDia = progressFromRow(
    row({
      organization_id: "al-dia",
      gate_completed_at: daysAgo(1),
      has_core_offer: true,
      has_primary_avatar: true,
      connected_source_count: 1,
      funnels: [{ templateId: "webinar", bound: 7 }],
      historical_snapshot_count: 1,
      member_count: 2,
    })
  );

  it("pone primero a la que no terminó la configuración inicial", () => {
    expect([alDia, trabada].sort(sortByNeedsAttention)[0].organizationId).toBe(
      "trabada"
    );
  });

  it("a igual gate, primero la que tiene más pendientes", () => {
    const base = { gate_completed_at: daysAgo(1) };
    const muchos = progressFromRow(row({ ...base, organization_id: "muchos" }));
    const pocos = progressFromRow(
      row({
        ...base,
        organization_id: "pocos",
        connected_source_count: 1,
        historical_snapshot_count: 1,
        member_count: 2,
      })
    );
    expect([pocos, muchos].sort(sortByNeedsAttention)[0].organizationId).toBe(
      "muchos"
    );
  });

  it("a igual estado, primero la más vieja", () => {
    // Una org creada hoy con todo pendiente es normal; una de hace tres
    // semanas en el mismo estado es un cliente trabado.
    const vieja = progressFromRow(
      row({ organization_id: "vieja", created_at: daysAgo(30) })
    );
    const nueva = progressFromRow(
      row({ organization_id: "nueva", created_at: daysAgo(0) })
    );
    expect([nueva, vieja].sort(sortByNeedsAttention)[0].organizationId).toBe(
      "vieja"
    );
  });
});

describe("organizaciones a las que el onboarding no les aplica", () => {
  it("marca applies=false a un holding y a una org excusada", () => {
    expect(progressFromRow(row({ account_type: "holding" })).applies).toBe(false);
    expect(progressFromRow(row({ skip_onboarding: true })).applies).toBe(false);
    expect(progressFromRow(row()).applies).toBe(true);
  });

  it("las manda al final, aunque tengan todo pendiente", () => {
    /*
     * Es el caso que apareció con datos reales: cuatro holdings con el
     * checklist en cero encabezaban la lista y tapaban a los clientes que sí
     * estaban trabados.
     */
    const holding = progressFromRow(
      row({ organization_id: "holding", account_type: "holding" })
    );
    const clienteAlDia = progressFromRow(
      row({
        organization_id: "cliente",
        gate_completed_at: daysAgo(1),
        has_core_offer: true,
        has_primary_avatar: true,
        connected_source_count: 1,
        funnels: [{ templateId: "webinar", bound: 7 }],
        historical_snapshot_count: 1,
        member_count: 2,
      })
    );

    const orden = [holding, clienteAlDia].sort(sortByNeedsAttention);
    expect(orden.map((o) => o.organizationId)).toEqual(["cliente", "holding"]);
  });
});
