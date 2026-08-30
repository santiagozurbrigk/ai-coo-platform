import type { MemberTimeReport } from "@/types/workboard";
import { brandColors } from "@/lib/brand";

/** Mock — reporte semanal de tiempo por persona (Phase 2: tracking real) */
export const mockMemberTimeReports: MemberTimeReport[] = [
  {
    memberId: "m1",
    name: "Valentina Ruiz",
    initials: "VR",
    avatarColor: brandColors.primary,
    totalHours: 38,
    strategicPercent: 62,
    operationalPercent: 38,
    topTasks: [
      {
        taskId: "t1",
        title: "Revisar script de closing Q2",
        hours: 12,
        kind: "strategic",
      },
      {
        taskId: "t2",
        title: "Coaching 1:1 con setters",
        hours: 9,
        kind: "strategic",
      },
      {
        taskId: "t3",
        title: "Responder DMs de leads calientes",
        hours: 7,
        kind: "operational",
      },
    ],
  },
  {
    memberId: "m2",
    name: "Juan Pérez",
    initials: "JP",
    avatarColor: "#2563EB",
    totalHours: 42,
    strategicPercent: 28,
    operationalPercent: 72,
    topTasks: [
      {
        taskId: "t4",
        title: "Follow-up conversaciones sin responder",
        hours: 14,
        kind: "operational",
      },
      {
        taskId: "t5",
        title: "Agendar calls de discovery",
        hours: 11,
        kind: "operational",
      },
      {
        taskId: "t6",
        title: "Actualizar CRM post-llamada",
        hours: 8,
        kind: "operational",
      },
    ],
  },
  {
    memberId: "m3",
    name: "María López",
    initials: "ML",
    avatarColor: "#059669",
    totalHours: 35,
    strategicPercent: 55,
    operationalPercent: 45,
    topTasks: [
      {
        taskId: "t7",
        title: "Onboarding nuevos clientes mayo",
        hours: 10,
        kind: "strategic",
      },
      {
        taskId: "t8",
        title: "Revisar entregas módulo 2",
        hours: 9,
        kind: "operational",
      },
      {
        taskId: "t9",
        title: "Diseñar caso de éxito Sofía H.",
        hours: 8,
        kind: "strategic",
      },
    ],
  },
  {
    memberId: "m4",
    name: "Santiago Zurbrigk",
    initials: "SZ",
    avatarColor: "#D97706",
    totalHours: 28,
    strategicPercent: 78,
    operationalPercent: 22,
    topTasks: [
      {
        taskId: "t10",
        title: "Planificar lanzamiento junio",
        hours: 11,
        kind: "strategic",
      },
      {
        taskId: "t11",
        title: "Revisar métricas de funnel",
        hours: 8,
        kind: "strategic",
      },
      {
        taskId: "t12",
        title: "Aprobar creativos de ads",
        hours: 5,
        kind: "operational",
      },
    ],
  },
];
