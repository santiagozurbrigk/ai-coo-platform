/**
 * Section root → default child route (mirrors sidebar primary links).
 * String literals only — safe to import from next.config.ts (no path aliases).
 */
export const sectionRedirects: { source: string; destination: string }[] = [
  { source: "/sales", destination: "/sales/inbox" },
  { source: "/operations", destination: "/operations/weekly-inputs" },
  { source: "/executive-reports", destination: "/executive-reports/weekly" },
  { source: "/business-context", destination: "/business-context/documents" },
  { source: "/intelligence", destination: "/intelligence/insights" },
  { source: "/team", destination: "/team/members" },
  { source: "/super-admin", destination: "/super-admin/organizations" },
];
