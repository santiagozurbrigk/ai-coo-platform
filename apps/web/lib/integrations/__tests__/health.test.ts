import { describe, expect, it } from "vitest";
import {
  buildHealth,
  deriveState,
  lastErrorIssue,
  missingConfigIssue,
  noDataYetIssue,
  sortIssues,
  summarize,
  unmappedEventsIssue,
  type IntegrationIssue,
} from "../health";
import {
  getIntegrationDefinition,
  groupByCategory,
  INTEGRATION_DEFINITIONS,
  LISTED_INTEGRATIONS,
} from "../registry";
import { INTEGRATION_PROVIDERS } from "@/constants/integrations";
import { INTEGRATION_BRAND_COLORS } from "../brand-colors";

const warning: IntegrationIssue = { level: "warning", message: "aviso" };
const error: IntegrationIssue = { level: "error", message: "roto" };
const info: IntegrationIssue = { level: "info", message: "dato" };

describe("deriveState", () => {
  it("sin conectar gana sobre cualquier aviso", () => {
    expect(deriveState({ connected: false, issues: [error] })).toBe(
      "not_connected",
    );
  });

  it("sincronizando gana sobre todo", () => {
    expect(
      deriveState({ connected: true, syncing: true, issues: [error] }),
    ).toBe("syncing");
  });

  it("un error manda, aunque haya avisos menores", () => {
    expect(
      deriveState({ connected: true, issues: [info, error, warning] }),
    ).toBe("error");
  });

  it("un warning deja la integración en atención, no en error", () => {
    expect(deriveState({ connected: true, issues: [info, warning] })).toBe(
      "attention",
    );
  });

  it("los avisos informativos no degradan el estado", () => {
    expect(deriveState({ connected: true, issues: [info] })).toBe("connected");
  });
});

describe("buildHealth", () => {
  it("no arrastra avisos ni datos de una integración desconectada", () => {
    const health = buildHealth({
      provider: "vturb",
      connected: false,
      accountLabel: "cuenta vieja",
      lastSyncAt: "2026-01-01T00:00:00.000Z",
      records: 12,
      issues: [error],
    });

    expect(health.state).toBe("not_connected");
    expect(health.issues).toEqual([]);
    expect(health.accountLabel).toBeNull();
    expect(health.lastSyncAt).toBeNull();
    expect(health.records).toBeNull();
  });

  it("ordena los avisos por gravedad", () => {
    const health = buildHealth({
      provider: "hyros",
      connected: true,
      issues: [info, warning, error],
    });

    expect(health.issues.map((issue) => issue.level)).toEqual([
      "error",
      "warning",
      "info",
    ]);
  });
});

describe("sortIssues", () => {
  it("no muta el array recibido", () => {
    const issues = [info, error];
    sortIssues(issues);
    expect(issues.map((issue) => issue.level)).toEqual(["info", "error"]);
  });

  it("mantiene el orden de llegada entre avisos de igual gravedad", () => {
    const first = { level: "warning" as const, message: "primero" };
    const second = { level: "warning" as const, message: "segundo" };
    expect(sortIssues([first, second]).map((i) => i.message)).toEqual([
      "primero",
      "segundo",
    ]);
  });
});

describe("avisos", () => {
  it("lastErrorIssue no inventa un aviso cuando no hay error", () => {
    expect(lastErrorIssue(null)).toEqual([]);
    expect(lastErrorIssue("")).toEqual([]);
    expect(lastErrorIssue("401 Unauthorized")).toHaveLength(1);
    expect(lastErrorIssue("401 Unauthorized")[0].level).toBe("error");
  });

  it("noDataYetIssue sólo avisa cuando no hay nada, y es informativo", () => {
    expect(noDataYetIssue(3, "ningún cobro")).toEqual([]);
    const issues = noDataYetIssue(0, "ningún cobro", "Revisá el webhook.");
    expect(issues[0].level).toBe("info");
    expect(issues[0].action).toBe("Revisá el webhook.");
  });

  it("missingConfigIssue es warning porque la medida saldría equivocada", () => {
    expect(
      missingConfigIssue({
        missing: 0,
        total: 4,
        what: "videos sin pitch time",
        breaks: "no se puede medir",
        action: "configuralo",
      }),
    ).toEqual([]);

    const issues = missingConfigIssue({
      missing: 2,
      total: 4,
      what: "videos no tienen pitch time",
      breaks: "no se puede medir quién llegó al CTA",
      action: "Configuralo en VTurb.",
    });
    expect(issues[0].level).toBe("warning");
    expect(issues[0].message).toContain("2 de 4");
  });

  it("unmappedEventsIssue concuerda en singular y plural", () => {
    expect(unmappedEventsIssue(0)).toEqual([]);
    expect(unmappedEventsIssue(1)[0].message).toContain(
      "1 evento que no se supo",
    );
    expect(unmappedEventsIssue(5)[0].message).toContain("5 eventos");
  });
});

describe("summarize", () => {
  it("cuenta atención y error juntos, y no cuenta las desconectadas", () => {
    const summary = summarize([
      buildHealth({ provider: "zernio", connected: true, issues: [] }),
      buildHealth({ provider: "vturb", connected: true, issues: [warning] }),
      buildHealth({ provider: "hyros", connected: true, issues: [error] }),
      buildHealth({ provider: "whop", connected: false }),
    ]);

    expect(summary).toEqual({
      total: 4,
      connected: 3,
      needAttention: 2,
      notConnected: 1,
    });
  });
});

describe("registro de integraciones", () => {
  it("todo proveedor declarado tiene entrada en el registro", () => {
    for (const provider of INTEGRATION_PROVIDERS) {
      expect(() => getIntegrationDefinition(provider)).not.toThrow();
    }
  });

  it("todo proveedor declarado tiene color de marca", () => {
    for (const provider of INTEGRATION_PROVIDERS) {
      expect(INTEGRATION_BRAND_COLORS[provider]).toBeDefined();
    }
  });

  it("no hay entradas duplicadas", () => {
    const providers = INTEGRATION_DEFINITIONS.map((d) => d.provider);
    expect(new Set(providers).size).toBe(providers.length);
  });

  it("toda integración oculta explica por qué", () => {
    for (const definition of INTEGRATION_DEFINITIONS) {
      if (!definition.listed) {
        expect(definition.unlistedReason, definition.provider).toBeTruthy();
      }
    }
  });

  it("toda integración declara al menos un flujo de datos y un módulo que alimenta", () => {
    for (const definition of INTEGRATION_DEFINITIONS) {
      expect(definition.dataFlows.length, definition.provider).toBeGreaterThan(
        0,
      );
      expect(definition.feeds.length, definition.provider).toBeGreaterThan(0);
    }
  });

  it("las que conectan por redirect declaran a dónde redirigen", () => {
    for (const definition of INTEGRATION_DEFINITIONS) {
      if (definition.connect === "redirect") {
        expect(definition.connectUrl, definition.provider).toBeTruthy();
      }
    }
  });

  it("groupByCategory no pierde ni duplica integraciones", () => {
    const items = LISTED_INTEGRATIONS.map((d) => ({ provider: d.provider }));
    const grouped = groupByCategory(items);
    const flattened = grouped.flatMap((group) => group.items);

    expect(flattened).toHaveLength(items.length);
    expect(new Set(flattened.map((i) => i.provider)).size).toBe(items.length);
  });

  it("groupByCategory omite las categorías vacías", () => {
    const grouped = groupByCategory([{ provider: "zernio" as const }]);
    expect(grouped).toHaveLength(1);
    expect(grouped[0].category).toBe("ventas");
  });
});
