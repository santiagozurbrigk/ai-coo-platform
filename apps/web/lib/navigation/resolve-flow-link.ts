import { paths } from "@/routes";
import type {
  IntelligenceBottleneck,
  IntelligenceInsight,
  IntelligenceOpportunity,
  IntelligenceRecommendation,
  MemoryChunk,
} from "@/types/intelligence";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function routeByKeywords(text: string, fallback: string): string {
  const t = text.toLowerCase();
  if (t.includes("sop") || t.includes("proceso") || t.includes("procedimiento")) {
    return `${paths.platform.operations.sops}#crear`;
  }
  if (
    t.includes("inbox") ||
    t.includes("conversación") ||
    t.includes("conversacion") ||
    t.includes("dm") ||
    t.includes("lead")
  ) {
    return paths.platform.sales.inbox;
  }
  if (t.includes("closing") || t.includes("llamada") || t.includes("cierre")) {
    return paths.platform.sales.closing;
  }
  if (t.includes("métrica") || t.includes("metrica") || t.includes("objeción") || t.includes("objecion")) {
    return paths.platform.sales.metrics;
  }
  if (t.includes("contenido") || t.includes("utm") || t.includes("marketing")) {
    return paths.platform.marketing.content;
  }
  if (t.includes("gasto") || t.includes("finanza") || t.includes("pago")) {
    return paths.platform.finance.root;
  }
  if (t.includes("input") || t.includes("equipo") || t.includes("semanal")) {
    return paths.platform.operations.weeklyInputs;
  }
  if (t.includes("integración") || t.includes("integracion") || t.includes("conectar")) {
    return paths.platform.integrations;
  }
  return fallback;
}

export function resolveExecutiveReportLink(): string {
  return paths.platform.executiveReports.weekly;
}

export function resolveMemoryLink(chunk: MemoryChunk): string {
  if (chunk.type === "sop" && UUID_RE.test(chunk.id)) {
    return paths.platform.sops.detail(chunk.id);
  }
  if (chunk.type === "reporte" && UUID_RE.test(chunk.id)) {
    return paths.platform.executiveReports.detail(chunk.id);
  }
  if (
    (chunk.type === "youtube" || chunk.type === "instagram") &&
    UUID_RE.test(chunk.id)
  ) {
    return paths.platform.marketing.contentDetail(chunk.id);
  }
  if (UUID_RE.test(chunk.id)) {
    return paths.platform.businessContext.viewer(chunk.id);
  }
  return paths.platform.businessContext.documents;
}

export function resolveRecommendationLink(
  item: IntelligenceRecommendation
): string {
  return routeByKeywords(
    `${item.title} ${item.action}`,
    paths.platform.agent.root
  );
}

export function resolveBottleneckLink(item: IntelligenceBottleneck): string {
  return routeByKeywords(
    `${item.area} ${item.impact}`,
    paths.platform.sales.inbox
  );
}

export function resolveInsightLink(item: IntelligenceInsight): string {
  return routeByKeywords(
    `${item.title} ${item.body} ${item.department}`,
    paths.platform.agent.root
  );
}

export function resolveOpportunityLink(item: IntelligenceOpportunity): string {
  return routeByKeywords(
    `${item.title} ${item.potential}`,
    paths.platform.marketing.overview
  );
}

export function resolveRiskLink(text: string): string {
  return routeByKeywords(text, paths.platform.sales.inbox);
}
