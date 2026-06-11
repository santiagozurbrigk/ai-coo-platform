import type { ContextDocument } from "@/types/business-context";

export const mockDocuments: ContextDocument[] = [
  {
    id: "doc1",
    title: "Closing call — Laura Gómez",
    category: "meetings",
    source: "Fathom",
    sourceType: "fathom",
    summary:
      "Llamada de cierre exitosa. Laura aceptó el programa avanzado con plan de 3 cuotas.",
    preview:
      "Laura mostró interés desde el minuto 5. Objeción principal: tiempo disponible. Se resolvió con el módulo flexible…",
    updatedAt: "24 may 2026",
    duration: "42 min",
    participants: ["Laura Gómez", "Santiago (closer)"],
    topics: ["pricing", "objeciones", "onboarding"],
    linkedSops: ["sop2", "sop3"],
    status: "indexed",
    externalUrl: "https://fathom.video/mock/laura-gomez",
    transcript: `Santiago: Hola Laura, gracias por el tiempo hoy.
Laura: Gracias a vos. Estuve revisando el programa y me interesa, pero me preocupa el tiempo.
Santiago: Totalmente válido. Por eso el módulo flexible permite avanzar a tu ritmo…
Laura: Ok, eso me cierra. ¿Cómo son las cuotas?
Santiago: Son 3 pagos mensuales sin interés…`,
    insights: [
      "La objeción de tiempo se resolvió con el módulo flexible — usar en guiones futuros",
      "Laura mencionó que vio el testimonio de María en Instagram antes de agendar",
      "Cierre en 38 min — por debajo del promedio de 45 min",
    ],
  },
  {
    id: "doc2",
    title: "Llamada de visión del fundador — May 2026",
    category: "meetings",
    source: "Fathom",
    sourceType: "fathom",
    summary:
      "Transcripción: escalar delivery sin aumentar headcount; prioridades del AI COO.",
    preview:
      "Foco en automatizar onboarding y reducir dependencia del fundador en QA de ventas. Meta: 50 clientes activos en Q3…",
    updatedAt: "12 may 2026",
    duration: "55 min",
    participants: ["Santiago (founder)", "Equipo ops"],
    topics: ["estrategia", "delivery", "headcount"],
    linkedSops: [],
    status: "indexed",
    transcript:
      "Founder: La prioridad de junio es escalar delivery sin contratar más CSMs…",
    insights: [
      "Meta Q3: 50 clientes activos sin aumentar headcount de delivery",
      "Priorizar automatización de onboarding antes de nueva cohorte",
    ],
  },
  {
    id: "doc3",
    title: "Framework de ventas Q2 — High ticket",
    category: "frameworks",
    source: "Google Docs",
    sourceType: "google_docs",
    summary:
      "Posicionamiento, manejo de objeciones y guiones de cierre para ofertas desde $5K.",
    preview:
      "Estructura SPIN + anclaje de precio. Incluye 5 objeciones frecuentes con respuestas probadas en DMs…",
    updatedAt: "15 may 2026",
    linkedSops: ["sop5", "sop10"],
    status: "indexed",
    insights: [
      "El anclaje de precio con caso de éxito aumenta conversión 12%",
      "Objeción #1 (precio) responde mejor con ROI a 90 días",
    ],
  },
  {
    id: "doc4",
    title: "Capacitación operadores — Semana 1",
    category: "training",
    source: "Notion",
    sourceType: "notion",
    summary:
      "Ramp de nuevos: herramientas, normas de Slack, rutas de escalamiento.",
    preview:
      "Día 1: acceso a herramientas. Día 2: normas de comunicación. Día 3: primer shadowing en bandeja de ventas…",
    updatedAt: "28 abr 2026",
    linkedSops: ["sop6"],
    status: "indexed",
  },
  {
    id: "doc5",
    title: "Script de objeciones — Programa premium",
    category: "sales",
    source: "Manual",
    sourceType: "manual",
    summary: "Guiones para las 5 objeciones más frecuentes en llamadas de closing.",
    preview:
      "Precio, tiempo, pareja, competidor y 'lo pienso'. Cada una con respuesta de 2-3 líneas y follow-up sugerido…",
    updatedAt: "10 may 2026",
    linkedSops: ["sop5"],
    status: "indexed",
    topics: ["objeciones", "closing", "scripts"],
  },
  {
    id: "doc6",
    title: "Playbook de delivery v1",
    category: "operations",
    source: "PDF",
    sourceType: "local",
    summary:
      "Proceso legacy de delivery — parcialmente reemplazado por SOPs.",
    preview:
      "Flujo de activación, verificación de pago, acceso a plataforma y kickoff. Versión anterior al módulo de comunidad…",
    updatedAt: "1 mar 2026",
    linkedSops: ["sop1", "sop7"],
    status: "indexed",
  },
  {
    id: "doc7",
    title: "Discovery call — Martín Rodríguez",
    category: "meetings",
    source: "Fathom",
    sourceType: "fathom",
    summary: "Primera llamada de diagnóstico. Lead calificado, agendó closing.",
    preview:
      "Martín tiene negocio de consultoría con 3 empleados. Busca escalar sin trabajar más horas. Pain principal: falta de sistema…",
    updatedAt: "20 may 2026",
    duration: "38 min",
    participants: ["Martín Rodríguez", "María (setter)"],
    topics: ["discovery", "qualification", "scaling"],
    linkedSops: ["sop2"],
    status: "indexed",
    transcript:
      "María: Contame un poco de tu negocio actual…\nMartín: Tengo una consultoría con 3 personas…",
    insights: [
      "Lead calificado — pain claro de falta de sistema operativo",
      "Agendó closing para el viernes — enviar caso de éxito similar",
    ],
  },
  {
    id: "doc8",
    title: "Modelo de pricing — Coaching grupal 2026",
    category: "frameworks",
    source: "Google Sheets",
    sourceType: "sheets",
    summary: "Estructura de precios, planes de pago y márgenes por cohorte.",
    preview:
      "3 tiers: Starter ($2.997), Avanzado ($4.997), VIP ($9.997). Márgenes y capacidad por cohorte documentados…",
    updatedAt: "5 may 2026",
    linkedSops: [],
    status: "indexed",
    topics: ["pricing", "margins", "cohortes"],
  },
  {
    id: "doc9",
    title: "Onboarding grabación — Módulo comunidad",
    category: "training",
    source: "Loom",
    sourceType: "loom",
    summary: "Video de 8 min explicando acceso y uso de la comunidad del programa.",
    preview:
      "Paso a paso: login, navegación, canales principales y cómo pedir ayuda al equipo de delivery…",
    updatedAt: "18 may 2026",
    duration: "8 min",
    linkedSops: ["sop1"],
    status: "indexed",
  },
  {
    id: "doc10",
    title: "Checklist semanal de operaciones",
    category: "operations",
    source: "Notion",
    sourceType: "notion",
    summary: "Rutina semanal del equipo ops: inputs, SOPs, métricas y escalamiento.",
    preview:
      "Lunes: revisar inputs. Miércoles: actualizar SOPs. Viernes: reporte ejecutivo y métricas de la semana…",
    updatedAt: "22 may 2026",
    linkedSops: ["sop6"],
    status: "indexed",
  },
];

export function getDocumentById(id: string): ContextDocument | undefined {
  return mockDocuments.find((d) => d.id === id);
}
