import type { GeneratedSop } from "@/types/sops";
import type { Sop } from "@/types/sops";

export const mockSops: Sop[] = [
  {
    id: "sop1",
    title: "Proceso de onboarding de nuevo cliente",
    department: "delivery",
    status: "active",
    lastUpdated: "18 may 2026",
    goal: "Activar al cliente en menos de 48 h post-compra con acceso completo al programa",
  },
  {
    id: "sop2",
    title: "Script de closing call",
    department: "sales",
    status: "active",
    lastUpdated: "22 may 2026",
    goal: "Estructura de llamada de cierre de 45 min con manejo de objeciones",
  },
  {
    id: "sop3",
    title: "Protocolo de seguimiento post-llamada",
    department: "sales",
    status: "active",
    lastUpdated: "15 may 2026",
    goal: "Follow-up en 24 h tras cada llamada de closing agendada o realizada",
  },
  {
    id: "sop4",
    title: "Proceso de entrega del programa",
    department: "delivery",
    status: "draft",
    lastUpdated: "24 may 2026",
    goal: "Entrega semanal de módulos, materiales y acceso a comunidad",
  },
  {
    id: "sop5",
    title: "Respuesta a objeciones de precio",
    department: "sales",
    status: "active",
    lastUpdated: "10 may 2026",
    goal: "Guiones y respuestas para las 5 objeciones más frecuentes en DMs",
  },
  {
    id: "sop6",
    title: "Input semanal de operaciones",
    department: "operations",
    status: "active",
    lastUpdated: "20 may 2026",
    goal: "Captura de contexto del equipo en menos de 2 minutos",
  },
  {
    id: "sop7",
    title: "Onboarding cliente — Módulo 1",
    department: "delivery",
    status: "outdated",
    lastUpdated: "14 feb 2026",
    goal: "Primeros 7 días post-compra (versión anterior al módulo de comunidad)",
  },
  {
    id: "sop8",
    title: "Calendario de contenido semanal",
    department: "marketing",
    status: "active",
    lastUpdated: "19 may 2026",
    goal: "Publicar 3 piezas/semana con CTA a ManyChat y métricas de alcance",
  },
  {
    id: "sop9",
    title: "Fathom → Motor de contexto",
    department: "operations",
    status: "draft",
    lastUpdated: "18 may 2026",
    goal: "Pipeline de ingestión de transcripciones para la base de conocimiento",
  },
  {
    id: "sop10",
    title: "DM Instagram — Flujo de calificación",
    department: "sales",
    status: "active",
    lastUpdated: "8 may 2026",
    goal: "Estandarizar la calificación del setter antes de enviar calendario",
  },
];

export const mockSopContents: Record<string, string> = {
  sop1: `## Objetivo
Activar al cliente en menos de 48 h post-compra.

## Pasos
1. Verificar pago en Finanzas y marcar cliente como activo
2. Enviar email de bienvenida con acceso a plataforma y comunidad
3. Agendar llamada de kickoff en las primeras 24 h
4. Confirmar acceso a Módulo 1 y primer ejercicio

## Checklist
- [ ] Pago confirmado
- [ ] Acceso a plataforma enviado
- [ ] Kickoff agendado
- [ ] Cliente respondió confirmación`,

  sop2: `## Estructura de la llamada (45 min)
- Min 0–5: Rapport y contexto del lead
- Min 5–20: Diagnóstico (situación actual, objetivo, obstáculos)
- Min 20–35: Presentación de la oferta y fit
- Min 35–45: Cierre, objeciones y próximos pasos

## Objeciones frecuentes
- Precio → anclar ROI y planes de pago
- Tiempo → mostrar casos de éxito con agendas similares
- "Lo pienso" → crear urgencia con cohorte y bonus`,

  sop3: `## Ventana de follow-up
- +2 h: mensaje de agradecimiento por la llamada
- +24 h: resumen de lo acordado + link de pago si aplica
- +72 h: último touch antes de marcar como frío

## Plantilla ManyChat
"Hola {nombre}, gracias por tu tiempo hoy. Te dejo el resumen de lo que charlamos…"`,
};

export function getSopById(id: string): Sop | undefined {
  return mockSops.find((s) => s.id === id);
}

export function getMockSopContent(id: string): string {
  const sop = getSopById(id);
  if (mockSopContents[id]) return mockSopContents[id];
  return sop
    ? `## ${sop.title}\n\n${sop.goal}\n\n_Contenido completo disponible en la próxima fase._`
    : "";
}

export function generateMockSop(form: {
  goal: string;
  department: string;
  expectedOutcome: string;
  additionalContext: string;
}): GeneratedSop {
  const deptLabel =
    {
      sales: "Ventas",
      delivery: "Delivery",
      operations: "Operaciones",
      marketing: "Marketing",
      founder: "Founder",
      general: "General",
    }[form.department] ?? form.department;

  return {
    title: `SOP — ${form.goal.slice(0, 60)}${form.goal.length > 60 ? "…" : ""}`,
    sections: [
      {
        title: "Objetivo",
        items: [form.goal],
      },
      {
        title: "Departamento responsable",
        items: [deptLabel],
      },
      {
        title: "Resultado esperado",
        items: [
          form.expectedOutcome ||
            "Resultado medible al completar el proceso según los pasos definidos",
        ],
      },
      {
        title: "Pasos del proceso",
        items: [
          "Paso 1: Preparación — revisar contexto y materiales necesarios",
          "Paso 2: Ejecución — seguir el flujo estándar del departamento",
          "Paso 3: Verificación — confirmar que el resultado esperado se cumplió",
          "Paso 4: Registro — documentar en la plataforma y notificar al equipo",
        ],
      },
      {
        title: "Checklist de calidad",
        items: [
          "Criterio de éxito definido y comunicado al equipo",
          "Responsable asignado por paso",
          "Tiempo máximo de ejecución documentado",
          "Excepciones y escalamiento definidos",
        ],
      },
      ...(form.additionalContext
        ? [
            {
              title: "Contexto adicional",
              items: [form.additionalContext],
            },
          ]
        : []),
    ],
  };
}
