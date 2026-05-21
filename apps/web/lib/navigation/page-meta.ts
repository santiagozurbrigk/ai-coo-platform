const PAGE_META: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard": {
    title: "Panel",
    subtitle: "Vista operativa en 30 segundos",
  },
  "/sales/inbox": {
    title: "Bandeja de ventas",
    subtitle: "Inteligencia de conversaciones",
  },
  "/sales/metrics": {
    title: "Métricas de ventas",
    subtitle: "Rendimiento y tendencias de agendamiento",
  },
  "/operations/weekly-inputs": {
    title: "Inputs semanales",
    subtitle: "Contexto del equipo en menos de 2 minutos",
  },
  "/executive-reports/weekly": {
    title: "Reporte semanal",
    subtitle: "Inteligencia ejecutiva",
  },
  "/executive-reports/monthly": {
    title: "Reporte mensual",
    subtitle: "Inteligencia ejecutiva",
  },
  "/executive-reports/history": {
    title: "Historial de reportes",
    subtitle: "Reportes ejecutivos anteriores",
  },
  "/sops": { title: "Biblioteca de SOPs", subtitle: "Sistemas operativos vivos" },
  "/sops/create": { title: "Crear SOP", subtitle: "Generación asistida por IA" },
  "/business-context/documents": {
    title: "Contexto de negocio",
    subtitle: "Memoria organizacional",
  },
  "/integrations": {
    title: "Integraciones",
    subtitle: "Fuentes de datos conectadas",
  },
  "/intelligence/insights": {
    title: "Insights",
    subtitle: "Inteligencia operativa con IA",
  },
  "/intelligence/recommendations": {
    title: "Recomendaciones",
    subtitle: "Acciones sugeridas",
  },
  "/intelligence/bottlenecks": {
    title: "Cuellos de botella",
    subtitle: "Fricción detectada en la operación",
  },
  "/intelligence/opportunities": {
    title: "Oportunidades",
    subtitle: "Señales de crecimiento",
  },
  "/intelligence/ai-memory": {
    title: "Memoria IA",
    subtitle: "Grafo de conocimiento organizacional",
  },
  "/team/members": { title: "Miembros del equipo", subtitle: "Personas y accesos" },
  "/team/roles": { title: "Roles", subtitle: "Modelo de permisos" },
  "/settings": { title: "Configuración", subtitle: "Organización y perfil" },
  "/founder": {
    title: "Área del fundador",
    subtitle: "Vista estratégica de la operación",
  },
  "/super-admin/organizations": {
    title: "Organizaciones",
    subtitle: "Clientes de la plataforma",
  },
  "/super-admin/founders": {
    title: "Fundadores",
    subtitle: "Cuentas de fundadores",
  },
  "/super-admin/team-accounts": {
    title: "Cuentas de equipo",
    subtitle: "Usuarios provisionados",
  },
  "/super-admin/ai-usage": {
    title: "Uso de IA",
    subtitle: "Consumo por modelo",
  },
  "/super-admin/cost-tracking": {
    title: "Seguimiento de costos",
    subtitle: "Infraestructura y costos de IA",
  },
  "/super-admin/profitability": {
    title: "Rentabilidad",
    subtitle: "Márgenes por organización",
  },
};

export function getPageMeta(pathname: string): {
  title: string;
  subtitle?: string;
} {
  if (PAGE_META[pathname]) {
    return PAGE_META[pathname];
  }

  if (
    pathname.startsWith("/executive-reports/") &&
    pathname !== "/executive-reports/history"
  ) {
    return { title: "Detalle del reporte", subtitle: "Inteligencia ejecutiva" };
  }
  if (pathname.startsWith("/sops/") && pathname !== "/sops/create") {
    return { title: "Detalle del SOP", subtitle: "Sistema operativo vivo" };
  }
  if (
    pathname.startsWith("/business-context/") &&
    pathname !== "/business-context/documents"
  ) {
    return { title: "Visor de contexto", subtitle: "Documento y transcripción" };
  }

  return { title: "AI COO", subtitle: undefined };
}
