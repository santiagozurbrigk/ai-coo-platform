const PAGE_META: Record<string, { title: string; subtitle?: string }> = {
  "/login": {
    title: "Iniciar sesión",
    subtitle: "Panel cliente — fundadores y equipo",
  },
  "/onboarding": {
    title: "Configuración inicial",
    subtitle: "Contexto de negocio para personalizar la IA",
  },
  "/superadmin/login": {
    title: "Super Admin",
    subtitle: "Acceso interno restringido",
  },
  "/dashboard": {
    title: "Panel General",
    subtitle: "Vista operativa en 30 segundos",
  },
  "/finance": {
    title: "Finanzas",
    subtitle: "Salud financiera en tiempo real",
  },
  "/finance/expenses": {
    title: "Gastos",
    subtitle: "Gastos fijos, suscripciones y compensación del equipo",
  },
  "/agent": {
    title: "Agente de negocio",
    subtitle: "Con acceso a todo el contexto de tu negocio",
  },
  "/marketing": {
    title: "Marketing",
    subtitle: "Rendimiento de contenido Instagram y conexión con ventas",
  },
  "/marketing/content": {
    title: "Contenido",
    subtitle: "Biblioteca visual de publicaciones y métricas por pieza",
  },
  "/marketing/sales-connection": {
    title: "Conexión con Ventas",
    subtitle: "Qué contenido genera conversaciones, bookings y ventas",
  },
  "/sales/inbox": {
    title: "Bandeja de ventas",
    subtitle: "Conversación + recorrido de contenido del lead",
  },
  "/sales/metrics": {
    title: "Métricas de ventas",
    subtitle: "Rendimiento por closer, agendamientos y operación comercial",
  },
  "/sales/marketing-insights": {
    title: "Marketing Insights",
    subtitle: "Inteligencia de contenido — qué influye en conversaciones y ventas",
  },
  "/sales/marketing-insights/library": {
    title: "Biblioteca de contenido",
    subtitle: "Assets desde Google Drive",
  },
  "/sales/closing": {
    title: "Closing",
    subtitle: "Calendario de cierre, Calendly y resultados",
  },
  "/clients": {
    title: "Clientes",
    subtitle: "Desde el cierre hasta caso de éxito",
  },
  "/operations/overview": {
    title: "Operaciones",
    subtitle: "Salud operativa del negocio",
  },
  "/operations/sops": {
    title: "SOPs",
    subtitle: "Biblioteca y creación de sistemas operativos",
  },
  "/operations/team-inputs": {
    title: "Team Inputs",
    subtitle: "Contexto intencional para la IA y el liderazgo",
  },
  "/workboard": {
    title: "Tablero de trabajo",
    subtitle: "Tareas del equipo por área y estado",
  },
  "/operations/weekly-inputs": {
    title: "Team Inputs",
    subtitle: "Contexto intencional para la IA y el liderazgo",
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
  "/sops": {
    title: "SOPs",
    subtitle: "Biblioteca y creación de sistemas operativos",
  },
  "/team": {
    title: "Equipo",
    subtitle: "Miembros y roles de la organización",
  },
  "/business-context/documents": {
    title: "Contexto de negocio",
    subtitle: "Memoria organizacional",
  },
  "/integrations": {
    title: "Integraciones",
    subtitle: "Fuentes de datos conectadas",
  },
  "/intelligence": {
    title: "Inteligencia",
    subtitle: "Insights, recomendaciones, cuellos de botella, oportunidades y memoria IA",
  },
  "/settings": { title: "Configuración", subtitle: "Organización y perfil" },
  "/founder": {
    title: "Área del fundador",
    subtitle: "Vista estratégica de la operación",
  },
  "/super-admin/organizations": {
    title: "Organizaciones",
    subtitle: "Clientes de la plataforma",
  },
  "/super-admin/organizations/new": {
    title: "Crear cuenta",
    subtitle: "Nueva organización y founder",
  },
  "/super-admin/users": {
    title: "Usuarios",
    subtitle: "Todos los perfiles de la plataforma",
  },
  "/super-admin/founders": {
    title: "Usuarios",
    subtitle: "Redirige a /super-admin/users",
  },
  "/super-admin/team-accounts": {
    title: "Usuarios",
    subtitle: "Redirige a /super-admin/users",
  },
  "/super-admin/profitability": {
    title: "Profitability",
    subtitle: "MRR, tokens y márgenes",
  },
  "/super-admin/infrastructure": {
    title: "Infrastructure",
    subtitle: "Stack y conteos de la plataforma",
  },
  "/super-admin/ai-brain": {
    title: "Cerebro de IA general",
    subtitle: "Capa global de conocimiento — metodologías, frameworks y playbooks",
  },
  "/super-admin/ai-brain/library": {
    title: "Biblioteca de contenido",
    subtitle: "Documentos cargados en el cerebro global",
  },
  "/super-admin/ai-brain/add": {
    title: "Añadir contenido",
    subtitle: "Ampliar el conocimiento global de la plataforma",
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
  if (pathname.startsWith("/marketing/content/") && pathname !== "/marketing/content") {
    return { title: "Publicación", subtitle: "Detalle de contenido — Marketing" };
  }
  if (pathname.startsWith("/sales/marketing-insights/content/")) {
    return { title: "Publicación", subtitle: "Detalle de contenido — Marketing" };
  }
  if (
    pathname.startsWith("/super-admin/organizations/") &&
    pathname !== "/super-admin/organizations/new"
  ) {
    return {
      title: "Detalle de organización",
      subtitle: "Super Admin",
    };
  }
  if (
    pathname.startsWith("/super-admin/ai-brain/") &&
    pathname !== "/super-admin/ai-brain/library" &&
    pathname !== "/super-admin/ai-brain/add"
  ) {
    return {
      title: "Visor de documento",
      subtitle: "Cerebro de IA general",
    };
  }
  return { title: "AI COO", subtitle: undefined };
}
