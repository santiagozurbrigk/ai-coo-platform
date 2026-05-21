/**
 * Centralized route paths — single source of truth for navigation and links.
 * File-based routing lives in app/; this file defines path constants only.
 */

const PLATFORM = "";

export const paths = {
  home: "/",
  demo: "/demo",
  designSystem: "/design-system",

  platform: {
    dashboard: `${PLATFORM}/dashboard`,

    sales: {
      inbox: `${PLATFORM}/sales/inbox`,
      metrics: `${PLATFORM}/sales/metrics`,
    },

    operations: {
      weeklyInputs: `${PLATFORM}/operations/weekly-inputs`,
    },

    executiveReports: {
      weekly: `${PLATFORM}/executive-reports/weekly`,
      monthly: `${PLATFORM}/executive-reports/monthly`,
      history: `${PLATFORM}/executive-reports/history`,
      detail: (id: string) => `${PLATFORM}/executive-reports/${id}`,
    },

    sops: {
      library: `${PLATFORM}/sops`,
      create: `${PLATFORM}/sops/create`,
      detail: (id: string) => `${PLATFORM}/sops/${id}`,
    },

    businessContext: {
      documents: `${PLATFORM}/business-context/documents`,
      viewer: (id: string) => `${PLATFORM}/business-context/${id}`,
    },

    intelligence: {
      insights: `${PLATFORM}/intelligence/insights`,
      recommendations: `${PLATFORM}/intelligence/recommendations`,
      bottlenecks: `${PLATFORM}/intelligence/bottlenecks`,
      opportunities: `${PLATFORM}/intelligence/opportunities`,
      aiMemory: `${PLATFORM}/intelligence/ai-memory`,
    },

    integrations: `${PLATFORM}/integrations`,

    team: {
      members: `${PLATFORM}/team/members`,
      roles: `${PLATFORM}/team/roles`,
    },

    settings: `${PLATFORM}/settings`,
  },

  founder: {
    root: "/founder",
  },

  superAdmin: {
    root: "/super-admin",
    organizations: "/super-admin/organizations",
    founders: "/super-admin/founders",
    teamAccounts: "/super-admin/team-accounts",
    aiUsage: "/super-admin/ai-usage",
    costTracking: "/super-admin/cost-tracking",
    profitability: "/super-admin/profitability",
  },
} as const;
