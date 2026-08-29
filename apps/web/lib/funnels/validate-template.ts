/**
 * lib/funnels/validate-template.ts
 *
 * Validador de integridad de plantillas.
 *
 * Existe porque agregar un embudo tiene que ser agregar un archivo, y un archivo
 * suelto sin red de seguridad se rompe en silencio: un denominador que apunta a
 * un step inexistente, un puntero north-star a una métrica que no existe, o dos
 * métricas con el mismo ID producirían números mal calculados sin ningún error
 * visible.
 *
 * El typecheck no alcanza: los IDs son strings y las referencias entre steps son
 * lógicas, no estructurales.
 */

import { isSpineStageId, spineStageOrder } from "./spine";
import { getUniversalKpi } from "./kpis";
import type { FunnelTemplate, MetricDefinition, MetricRef } from "./types";
import { SOURCE_DOC_VERSION } from "./types";
import { FUNNEL_TEMPLATES, isFunnelTemplateId } from "./templates";

export type ValidationIssue = {
  templateId: string;
  /** Ruta legible al punto del problema, ej. "steps[3].benchmarks". */
  path: string;
  message: string;
};

function collectMetrics(template: FunnelTemplate): MetricDefinition[] {
  return [
    ...template.funnelMetrics,
    ...template.steps.flatMap((step) => step.metrics),
  ];
}

export function validateTemplate(template: FunnelTemplate): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const push = (path: string, message: string) =>
    issues.push({ templateId: template.id, path, message });

  if (!isFunnelTemplateId(template.id)) {
    push("id", `El id "${template.id}" no está declarado en FUNNEL_TEMPLATE_IDS.`);
  }

  if (template.sourceDocVersion !== SOURCE_DOC_VERSION) {
    push(
      "sourceDocVersion",
      `Transcribe la versión ${template.sourceDocVersion} pero el módulo está en ${SOURCE_DOC_VERSION}. ` +
        `Revisar el documento fuente antes de asumir que la plantilla está vigente.`
    );
  }

  if (template.accentToken.startsWith("#")) {
    push("accentToken", "Debe ser un token del design system, no un hex (ver DESIGN.md).");
  }

  // ─── IDs de step ────────────────────────────────────────────────────────────
  const stepIds = new Set<string>();
  for (const [i, step] of template.steps.entries()) {
    if (stepIds.has(step.id)) push(`steps[${i}].id`, `ID de step duplicado: ${step.id}`);
    stepIds.add(step.id);

    if (!isSpineStageId(step.stageId)) {
      push(`steps[${i}].stageId`, `Etapa de spine desconocida: ${step.stageId}`);
    }
  }

  // ─── Orden ──────────────────────────────────────────────────────────────────
  const orders = template.steps.map((s) => s.order);
  const expected = template.steps.map((_, i) => i + 1);
  if (orders.join(",") !== expected.join(",")) {
    push("steps[].order", `El orden debe ser 1..n consecutivo. Recibido: [${orders.join(", ")}]`);
  }

  // El recorrido de steps nunca puede retroceder en el spine: es lo que hace
  // posible el diagnóstico "caminar el spine de izquierda a derecha".
  for (let i = 1; i < template.steps.length; i += 1) {
    const prev = template.steps[i - 1]!;
    const curr = template.steps[i]!;
    if (!isSpineStageId(prev.stageId) || !isSpineStageId(curr.stageId)) continue;
    if (spineStageOrder(curr.stageId) < spineStageOrder(prev.stageId)) {
      push(
        `steps[${i}].stageId`,
        `El step "${curr.id}" (${curr.stageId}) retrocede en el spine respecto de "${prev.id}" (${prev.stageId}).`
      );
    }
  }

  // ─── IDs de métrica ─────────────────────────────────────────────────────────
  const allMetrics = collectMetrics(template);
  const metricIds = new Set<string>();
  for (const metric of allMetrics) {
    if (metricIds.has(metric.id)) {
      push("metrics", `ID de métrica duplicado: ${metric.id}`);
    }
    metricIds.add(metric.id);
  }

  // ─── Referencias ────────────────────────────────────────────────────────────
  const checkRef = (ref: MetricRef | null, path: string) => {
    if (!ref) return;
    if (ref.kind === "step" && !stepIds.has(ref.stepId)) {
      push(path, `Referencia a un step inexistente: ${ref.stepId}`);
    }
    if (ref.kind === "stage" && !isSpineStageId(ref.stageId)) {
      push(path, `Referencia a una etapa de spine inexistente: ${ref.stageId}`);
    }
    if (ref.kind === "metric" && !metricIds.has(ref.metricId) && !getUniversalKpi(ref.metricId)) {
      push(path, `Referencia a una métrica inexistente: ${ref.metricId}`);
    }
  };

  for (const metric of allMetrics) {
    checkRef(metric.numerator, `metric[${metric.id}].numerator`);
    checkRef(metric.denominator, `metric[${metric.id}].denominator`);
    for (const [i, ref] of (metric.compose?.refs ?? []).entries()) {
      checkRef(ref, `metric[${metric.id}].compose.refs[${i}]`);
    }
    if (!metric.numerator && !metric.compose) {
      push(
        `metric[${metric.id}]`,
        "Una métrica sin numerador debe declarar `compose`, o no es computable."
      );
    }
  }

  // ─── Benchmarks ─────────────────────────────────────────────────────────────
  for (const [i, step] of template.steps.entries()) {
    const stepMetricIds = new Set(step.metrics.map((m) => m.id));

    for (const key of Object.keys(step.benchmarks)) {
      if (!stepMetricIds.has(key)) {
        push(
          `steps[${i}].benchmarks`,
          `El benchmark "${key}" no corresponde a ninguna métrica de este step.`
        );
      }
    }

    for (const metric of step.metrics) {
      if (!(metric.id in step.benchmarks)) {
        push(
          `steps[${i}].benchmarks`,
          `Falta el benchmark de "${metric.id}". Si el documento no da rango, usar { kind: "context_set" }.`
        );
      }
    }

    for (const [key, benchmark] of Object.entries(step.benchmarks)) {
      if (benchmark.kind === "range" && benchmark.min > benchmark.max) {
        push(`steps[${i}].benchmarks.${key}`, `Rango invertido: min ${benchmark.min} > max ${benchmark.max}`);
      }
    }
  }

  // ─── Punteros (§3.6) ────────────────────────────────────────────────────────
  const pointers = [
    ["northStar", template.northStar],
    ["leadingIndicator", template.leadingIndicator],
    ["governingRate", template.governingRate],
  ] as const;

  for (const [name, pointer] of pointers) {
    const resolvable = metricIds.has(pointer.metricId) || Boolean(getUniversalKpi(pointer.metricId));
    if (!resolvable) {
      push(name, `Apunta a una métrica que no existe ni en la plantilla ni en los KPIs universales: ${pointer.metricId}`);
    }
  }

  return issues;
}

export function validateAllTemplates(): ValidationIssue[] {
  return FUNNEL_TEMPLATES.flatMap(validateTemplate);
}
