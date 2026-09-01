import { describe, expect, it } from "vitest";
import {
  CLOSING_CALL_STATUSES,
  CLOSING_CALL_STATUS_HINT,
  CLOSING_CALL_STATUS_LABEL,
  acceptsManualOutcome,
  callHappened,
  callIsSale,
  callWasAttended,
  isClosingCallStatus,
  needsDisposition,
  syncMayOverwriteStatus,
} from "@/lib/closing/call-status";

describe("vocabulario de estados", () => {
  it("tiene etiqueta y descripción para cada estado", () => {
    for (const status of CLOSING_CALL_STATUSES) {
      expect(CLOSING_CALL_STATUS_LABEL[status]).toBeTruthy();
      expect(CLOSING_CALL_STATUS_HINT[status]).toBeTruthy();
    }
  });

  it("no tiene etiquetas repetidas: dos estados distintos se leen distinto", () => {
    const labels = CLOSING_CALL_STATUSES.map((s) => CLOSING_CALL_STATUS_LABEL[s]);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("reconoce sólo estados válidos", () => {
    expect(isClosingCallStatus("attended")).toBe(true);
    expect(isClosingCallStatus("cancelled")).toBe(true);
    expect(isClosingCallStatus("showed")).toBe(false);
    expect(isClosingCallStatus(undefined)).toBe(false);
  });
});

describe("asistencia vs venta", () => {
  it("asistir no es vender", () => {
    // Es el bug que originó la Fase 0: `showed` de GHL entraba como `closed`.
    expect(callWasAttended("attended")).toBe(true);
    expect(callIsSale("attended")).toBe(false);
  });

  it("sólo `closed` cuenta como venta", () => {
    expect(callIsSale("closed")).toBe(true);
    for (const status of CLOSING_CALL_STATUSES.filter((s) => s !== "closed")) {
      expect(callIsSale(status)).toBe(false);
    }
  });

  it("cuenta como asistencia todo lo que implica que el lead vino", () => {
    expect(callWasAttended("closed")).toBe(true);
    expect(callWasAttended("not_closed")).toBe(true);
    expect(callWasAttended("no_show")).toBe(false);
    expect(callWasAttended("cancelled")).toBe(false);
    expect(callWasAttended("scheduled")).toBe(false);
  });
});

describe("cancelar no es faltar", () => {
  it("una cancelada nunca ocurrió; un no-show sí", () => {
    expect(callHappened("cancelled")).toBe(false);
    expect(callHappened("no_show")).toBe(true);
  });

  it("una agendada todavía no ocurrió", () => {
    expect(callHappened("scheduled")).toBe(false);
  });
});

describe("needsDisposition", () => {
  const now = new Date("2026-09-01T12:00:00Z");

  it("una agendada que ya pasó necesita desenlace", () => {
    expect(needsDisposition("scheduled", "2026-08-30T10:00:00Z", now)).toBe(true);
  });

  it("una agendada futura no", () => {
    expect(needsDisposition("scheduled", "2026-09-05T10:00:00Z", now)).toBe(false);
  });

  it("una asistida siempre necesita desenlace, sin importar la fecha", () => {
    // El proveedor confirmó la asistencia; falta que una persona diga en qué
    // terminó. Es la cola de trabajo del closer.
    expect(needsDisposition("attended", "2026-09-05T10:00:00Z", now)).toBe(true);
  });

  it("una cancelada no necesita desenlace: no hay nada que cargar", () => {
    expect(needsDisposition("cancelled", "2026-08-30T10:00:00Z", now)).toBe(false);
  });

  it("los estados con resultado ya cargado no vuelven a la cola", () => {
    expect(needsDisposition("closed", "2026-08-30T10:00:00Z", now)).toBe(false);
    expect(needsDisposition("not_closed", "2026-08-30T10:00:00Z", now)).toBe(false);
    expect(needsDisposition("no_show", "2026-08-30T10:00:00Z", now)).toBe(false);
  });

  it("una fecha inválida no rompe ni inventa trabajo", () => {
    expect(needsDisposition("scheduled", "no-es-una-fecha", now)).toBe(false);
  });
});

describe("acceptsManualOutcome", () => {
  it("acepta resultado en agendada y en asistida", () => {
    // Antes la UI exigía `scheduled`, así que una llamada que GHL marcaba como
    // asistida no se podía cerrar desde OTC.
    expect(acceptsManualOutcome("scheduled")).toBe(true);
    expect(acceptsManualOutcome("attended")).toBe(true);
  });

  it("no permite pisar un resultado ya cargado", () => {
    expect(acceptsManualOutcome("closed")).toBe(false);
    expect(acceptsManualOutcome("not_closed")).toBe(false);
    expect(acceptsManualOutcome("no_show")).toBe(false);
    expect(acceptsManualOutcome("cancelled")).toBe(false);
  });
});

describe("syncMayOverwriteStatus", () => {
  it("no pisa lo que cargó una persona", () => {
    // El bug que hacía inviable el seguimiento: el cron devolvía a `scheduled`
    // cualquier estado manual que no fuera `closed`, cada hora.
    for (const status of CLOSING_CALL_STATUSES) {
      expect(syncMayOverwriteStatus({ status, statusSource: "manual" })).toBe(false);
    }
  });

  it("sí actualiza lo que viene del proveedor", () => {
    expect(syncMayOverwriteStatus({ status: "scheduled", statusSource: "sync" })).toBe(true);
    expect(syncMayOverwriteStatus({ status: "attended", statusSource: "sync" })).toBe(true);
    expect(syncMayOverwriteStatus({ status: "no_show", statusSource: "sync" })).toBe(true);
  });

  it("protege los cierres anteriores a la columna status_source", () => {
    // Las filas viejas quedaron en 'sync' aunque su cierre lo hubiera cargado
    // una persona. Sin esta protección, el primer sync posterior al cambio de
    // `showed` las devolvería a `attended`.
    expect(syncMayOverwriteStatus({ status: "closed", statusSource: "sync" })).toBe(false);
    expect(syncMayOverwriteStatus({ status: "closed", statusSource: null })).toBe(false);
  });

  it("trata un status_source ausente como sync", () => {
    expect(syncMayOverwriteStatus({ status: "scheduled" })).toBe(true);
  });
});
