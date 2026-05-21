import { paths } from "@/routes";

/** Rutas destino para flujos UX del prototipo (Fase 0.7) */
export const flowLinks = {
  executiveReportLatest: paths.platform.executiveReports.detail("er1"),
  weeklyInputs: paths.platform.operations.weeklyInputs,
  weeklyReport: paths.platform.executiveReports.weekly,

  risk: (id: string): string => {
    const map: Record<string, string> = {
      r1: paths.platform.intelligence.bottlenecks,
      r2: paths.platform.sales.inbox,
      r3: paths.platform.sops.detail("sop2"),
    };
    return map[id] ?? paths.platform.intelligence.insights;
  },

  opportunity: (id: string): string => {
    const map: Record<string, string> = {
      o1: paths.platform.sales.metrics,
      o2: paths.platform.integrations,
    };
    return map[id] ?? paths.platform.intelligence.opportunities;
  },

  insight: (id: string): string => {
    const map: Record<string, string> = {
      i1: paths.platform.intelligence.bottlenecks,
      i2: paths.platform.sales.metrics,
    };
    return map[id] ?? paths.platform.intelligence.insights;
  },

  recommendation: (id: string): string => {
    const map: Record<string, string> = {
      rec1: paths.platform.sops.create,
      rec2: paths.platform.businessContext.viewer("doc1"),
    };
    return map[id] ?? paths.platform.intelligence.recommendations;
  },

  bottleneck: (id: string): string => {
    const map: Record<string, string> = {
      b1: paths.platform.sops.detail("sop2"),
      b2: paths.platform.sales.inbox,
    };
    return map[id] ?? paths.platform.operations.weeklyInputs;
  },

  memory: (id: string): string => {
    const map: Record<string, string> = {
      mem1: paths.platform.businessContext.viewer("doc1"),
      mem2: paths.platform.sops.detail("sop1"),
      mem3: paths.platform.executiveReports.detail("er1"),
    };
    return map[id] ?? paths.platform.intelligence.aiMemory;
  },

  contextRelated: (label: string): string => {
    if (label.includes("SOP")) return paths.platform.sops.detail("sop2");
    if (label.includes("Framework")) return paths.platform.businessContext.viewer("doc1");
    return paths.platform.operations.weeklyInputs;
  },
} as const;
