/**
 * Centralized route paths — single source of truth for navigation and links.
 * File-based routing lives in app/; this file defines path constants only.
 */

const PLATFORM = "";

export const paths = {
  home: "/",
  auth: {
    login: "/login",
    onboarding: "/onboarding",
    callback: "/auth/callback",
  },
  demo: "/demo",
  designSystem: "/design-system",

  platform: {
    dashboard: `${PLATFORM}/dashboard`,

    finance: {
      root: `${PLATFORM}/finance`,
      expenses: `${PLATFORM}/finance/expenses`,
    },

    product: {
      root: `${PLATFORM}/product`,
      avatar: (id: string) => `${PLATFORM}/product/avatar/${id}`,
      offer: (id: string) => `${PLATFORM}/product/offer/${id}`,
      valueLadder: `${PLATFORM}/product/value-ladder`,
      proposition: `${PLATFORM}/product/proposition`,
    },

    lanzamientos: `${PLATFORM}/lanzamientos`,

    agent: {
      root: `${PLATFORM}/agent`,
      conversation: (id: string) => `${PLATFORM}/agent/${id}`,
      project: (id: string) => `${PLATFORM}/agent/project/${id}`,
      stage: (id: string) => `${PLATFORM}/agent/stage/${id}`,
    },

    workboard: {
      root: `${PLATFORM}/workboard`,
    },

    marketing: {
      overview: `${PLATFORM}/marketing`,
      content: `${PLATFORM}/marketing/content`,
      contentDetail: (id: string) => `${PLATFORM}/marketing/content/${id}`,
      salesConnection: `${PLATFORM}/marketing/sales-connection`,
      forms: `${PLATFORM}/marketing/forms`,
      formDetail: (id: string) => `${PLATFORM}/marketing/forms/${id}`,
    },

    sales: {
      inbox: `${PLATFORM}/sales/inbox`,
      metrics: `${PLATFORM}/sales/metrics`,
      closing: `${PLATFORM}/sales/closing`,
      /** @deprecated Usar paths.platform.marketing */
      marketingInsights: {
        dashboard: `${PLATFORM}/marketing`,
        library: `${PLATFORM}/marketing/content`,
        content: (id: string) => `${PLATFORM}/marketing/content/${id}`,
        journeys: `${PLATFORM}/marketing/sales-connection`,
        journeyDetail: (id: string) => `${PLATFORM}/marketing/sales-connection`,
      },
    },

    clients: {
      root: `${PLATFORM}/clients`,
      detail: (id: string) => `${PLATFORM}/clients/${id}`,
      pendingCalls: `${PLATFORM}/clients/pending-calls`,
    },

    operations: {
      overview: `${PLATFORM}/operations/overview`,
      sops: `${PLATFORM}/operations/sops`,
      teamInputs: `${PLATFORM}/operations/team-inputs`,
      /** Legacy */
      weeklyInputs: `${PLATFORM}/operations/team-inputs`,
    },

    executiveReports: {
      weekly: `${PLATFORM}/executive-reports/weekly`,
      monthly: `${PLATFORM}/executive-reports/monthly`,
      history: `${PLATFORM}/executive-reports/history`,
      detail: (id: string) => `${PLATFORM}/executive-reports/${id}`,
    },

    sops: {
      root: `${PLATFORM}/operations/sops`,
      library: `${PLATFORM}/operations/sops`,
      create: `${PLATFORM}/sops/create`,
      detail: (id: string) => `${PLATFORM}/sops/${id}`,
    },

    businessContext: {
      documents: `${PLATFORM}/business-context/documents`,
      viewer: (id: string) => `${PLATFORM}/business-context/${id}`,
    },

    intelligence: {
      root: `${PLATFORM}/intelligence`,
      insights: `${PLATFORM}/intelligence/insights`,
      recommendations: `${PLATFORM}/intelligence/recommendations`,
      bottlenecks: `${PLATFORM}/intelligence/bottlenecks`,
      opportunities: `${PLATFORM}/intelligence/opportunities`,
      aiMemory: `${PLATFORM}/intelligence/ai-memory`,
    },

    integrations: `${PLATFORM}/integrations`,
    integrationsDiscord: `${PLATFORM}/integrations/discord`,

    team: {
      root: `${PLATFORM}/team`,
      members: `${PLATFORM}/team/members`,
      roles: `${PLATFORM}/team/roles`,
    },

    settings: `${PLATFORM}/settings`,
  },

  founder: {
    root: "/founder",
  },

  superAdmin: {
    login: "/superadmin/login",
    dashboard: "/superadmin/dashboard",
    root: "/super-admin",
    organizations: "/super-admin/organizations",
    organizationDetail: (id: string) => `/super-admin/organizations/${id}`,
    organizationsNew: "/super-admin/organizations/new",
    users: "/super-admin/users",
    /** @deprecated Usar users */
    founders: "/super-admin/users",
    /** @deprecated Usar users */
    teamAccounts: "/super-admin/users",
    /** @deprecated Usar profitability */
    aiUsage: "/super-admin/profitability",
    /** @deprecated Usar profitability */
    costTracking: "/super-admin/profitability",
    profitability: "/super-admin/profitability",
    infrastructure: "/super-admin/infrastructure",
    clientHealth: "/super-admin/client-health",
    aiBrain: {
      root: "/super-admin/ai-brain",
      library: "/super-admin/ai-brain/library",
      documents: "/super-admin/ai-brain/library",
      upload: "/super-admin/ai-brain/add",
      add: "/super-admin/ai-brain/add",
      document: (id: string) => `/super-admin/ai-brain/${id}`,
    },
  },
} as const;
