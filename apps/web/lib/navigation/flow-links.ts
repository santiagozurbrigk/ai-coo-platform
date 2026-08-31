import { paths } from "@/routes";

/** Rutas destino para flujos UX del prototipo (Fase 0.7) */
export const flowLinks = {
  executiveReportLatest: paths.platform.executiveReports.detail("er1"),
  weeklyInputs: paths.platform.operations.weeklyInputs,
  weeklyReport: paths.platform.executiveReports.history,

  risk: (id: string): string => {
    const map: Record<string, string> = {
      r1: `${paths.platform.intelligence.root}#bottlenecks`,
      r2: paths.platform.sales.inbox,
      r3: paths.platform.sops.detail("sop2"),
      "r-objection-closing": `${paths.platform.sales.metrics}#objections`,
      "r-objection-setting": `${paths.platform.sales.metrics}#objections`,
      "r-objection-marketing": `${paths.platform.sales.metrics}#objections`,
    };
    return map[id] ?? paths.platform.intelligence.root;
  },

  opportunity: (id: string): string => {
    const map: Record<string, string> = {
      o1: paths.platform.sales.metrics,
      o2: paths.platform.integrations,
    };
    return map[id] ?? `${paths.platform.intelligence.root}#opportunities`;
  },

  insight: (id: string): string => {
    const map: Record<string, string> = {
      i1: `${paths.platform.intelligence.root}#bottlenecks`,
      i2: paths.platform.sales.metrics,
    };
    return map[id] ?? paths.platform.intelligence.root;
  },

  recommendation: (id: string): string => {
    const map: Record<string, string> = {
      rec1: `${paths.platform.sops.root}#crear`,
      rec2: paths.platform.businessContext.viewer("doc1"),
    };
    return map[id] ?? `${paths.platform.intelligence.root}#recommendations`;
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
    return map[id] ?? `${paths.platform.intelligence.root}#memoria`;
  },
} as const;
