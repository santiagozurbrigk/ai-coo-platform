import type { OperationsOverviewData } from "@/types/operations-overview";

export const mockOperationsOverview: OperationsOverviewData = {
  executiveReport: [
    "La semana del 19 al 25 de mayo mostró señales mixtas en el negocio de coaching. Ventas mantuvo un volumen saludable de conversaciones (47 activas) con booking rate al 34,2%, pero el tiempo de respuesta del equipo subió 18% respecto a la semana anterior.",
    "En Delivery, el 92% de las entregas del programa avanzado se completaron a tiempo. Sin embargo, 3 clientes del Módulo 2 reportaron confusión con el acceso a la comunidad — un patrón que se repitió en los inputs semanales del equipo.",
    "Operaciones detectó que el SOP de onboarding quedó desactualizado tras el lanzamiento del nuevo módulo de comunidad. El proceso manual de seguimiento post-llamada sigue funcionando, pero consume 4 h/semana del equipo de ops.",
    "Recomendación general: priorizar la actualización del SOP de onboarding y reasignar leads sin respuesta en Ventas antes de la cohorte de junio (12 clientes nuevos programados).",
  ],
  risks: [
    {
      id: "or1",
      title: "Setter Juan sin responder leads 3 días",
      description:
        "12 conversaciones en bandeja sin respuesta. Riesgo alto de ghosting y pérdida de oportunidades calientes.",
      level: "high",
      suggestedAction: "Revisar bandeja de Juan y reasignar leads críticos",
    },
    {
      id: "or2",
      title: "Acceso a comunidad genera tickets repetidos",
      description:
        "3 clientes del Módulo 2 con el mismo problema de acceso. Patrón detectado en inputs de Delivery.",
      level: "medium",
      suggestedAction: "Crear guía rápida y actualizar email de bienvenida",
    },
    {
      id: "or3",
      title: "SOP de onboarding desactualizado",
      description:
        "El proceso no refleja el módulo de comunidad lanzado en mayo. Afecta la cohorte de junio.",
      level: "low",
      suggestedAction: "Actualizar SOP antes del 1 de junio",
    },
  ],
  bottlenecks: [
    {
      id: "ob1",
      department: "sales",
      title: "Follow-up post-precio manual",
      description:
        "Los setters no tienen automatización de follow-up cuando el lead menciona precio y deja de responder.",
      impact: "high",
    },
    {
      id: "ob2",
      department: "delivery",
      title: "Onboarding Módulo 2 lento",
      description:
        "Tiempo promedio de activación: 4,2 días vs objetivo de 2 días. Cuello en verificación de pagos.",
      impact: "medium",
    },
    {
      id: "ob3",
      department: "operations",
      title: "Reportes semanales manuales",
      description:
        "2 departamentos aún envían reportes por WhatsApp en lugar del formulario de inputs.",
      impact: "medium",
    },
    {
      id: "ob4",
      department: "marketing",
      title: "Contenido sin métricas de conversión",
      description:
        "YouTube sincronizado pero sin etiquetado de piezas que generaron agendamientos.",
      impact: "low",
    },
  ],
  departments: [
    {
      id: "od-sales",
      area: "sales",
      name: "Ventas",
      status: "warning",
      statusLabel: "Atención",
      metrics: [
        { label: "Booking rate", value: "34,2%", trend: "up" },
        { label: "Conv. activas", value: "47", trend: "up" },
        { label: "Sin responder", value: "12", trend: "up" },
      ],
    },
    {
      id: "od-delivery",
      area: "delivery",
      name: "Delivery",
      status: "healthy",
      statusLabel: "Saludable",
      metrics: [
        { label: "Entregas a tiempo", value: "92%", trend: "up" },
        { label: "Tickets abiertos", value: "5", trend: "down" },
        { label: "NPS semanal", value: "8,4", trend: "neutral" },
      ],
    },
    {
      id: "od-operations",
      area: "operations",
      name: "Operaciones",
      status: "warning",
      statusLabel: "Atención",
      metrics: [
        { label: "SOPs activos", value: "8", trend: "neutral" },
        { label: "Inputs recibidos", value: "12/16", trend: "up" },
        { label: "Procesos rotos", value: "2", trend: "down" },
      ],
    },
    {
      id: "od-marketing",
      area: "marketing",
      name: "Marketing",
      status: "healthy",
      statusLabel: "Saludable",
      metrics: [
        { label: "Piezas publicadas", value: "6", trend: "up" },
        { label: "Alcance semanal", value: "89K", trend: "up" },
        { label: "Leads atribuidos", value: "23", trend: "up" },
      ],
    },
  ],
  recommendations: [
    {
      id: "rec1",
      title: "Actualizar SOP de onboarding",
      description:
        "Incluir el flujo de acceso a comunidad antes de la cohorte de junio.",
      priority: "high",
      department: "Operaciones",
    },
    {
      id: "rec2",
      title: "Automatizar follow-up post-precio",
      description:
        "Configurar secuencia en ManyChat para leads que dejan de responder tras ver precio.",
      priority: "high",
      department: "Ventas",
    },
    {
      id: "rec3",
      title: "Etiquetar contenido con impacto en ventas",
      description:
        "Vincular piezas de YouTube con conversaciones que generaron agendamientos.",
      priority: "medium",
      department: "Marketing",
    },
    {
      id: "rec4",
      title: "Completar inputs semanales faltantes",
      description: "4 departamentos aún no enviaron su input de la semana 21.",
      priority: "medium",
      department: "Operaciones",
    },
    {
      id: "rec5",
      title: "Revisar guía de acceso Módulo 2",
      description:
        "Reducir tickets repetidos con un video de 2 min en el email de bienvenida.",
      priority: "low",
      department: "Delivery",
    },
  ],
};
