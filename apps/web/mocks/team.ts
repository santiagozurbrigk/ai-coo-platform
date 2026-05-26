import type { RoleDefinition, TeamMember } from "@/types/team";

export const mockTeamMembers: TeamMember[] = [
  { id: "u1", name: "Nombre Fundador", email: "founder@acme.co", role: "founder", status: "active", lastLogin: "2026-05-21T08:00:00Z" },
  { id: "u2", name: "María López", email: "maria@acme.co", role: "operator", status: "active", lastLogin: "2026-05-21T14:00:00Z" },
  { id: "u3", name: "Jordan Lee", email: "jordan@acme.co", role: "operator", status: "active", lastLogin: "2026-05-20T18:00:00Z" },
  { id: "u4", name: "Sam Ortiz", email: "sam@acme.co", role: "project_manager", status: "away", lastLogin: "2026-05-18T10:00:00Z" },
  { id: "u5", name: "Casey Kim", email: "casey@acme.co", role: "viewer", status: "inactive", lastLogin: "2026-05-01T12:00:00Z" },
];

export const mockRoles: RoleDefinition[] = [
  { role: "founder", label: "Fundador", description: "Acceso total y vistas estratégicas", permissions: ["Todos los módulos", "Facturación", "Admin de equipo"] },
  { role: "admin", label: "Administrador", description: "Administración operativa", permissions: ["Todos los módulos", "Gestión de equipo"] },
  { role: "project_manager", label: "Gestor de proyecto", description: "Operaciones transversales", permissions: ["Operaciones", "SOPs", "Reportes"] },
  { role: "setter", label: "Setter", description: "Bandeja de ventas solo lectura", permissions: ["Bandeja de ventas", "Métricas de ventas"] },
  { role: "operator", label: "Operador", description: "Delivery e inputs", permissions: ["Inputs semanales", "Ver SOPs"] },
  { role: "viewer", label: "Solo lectura", description: "Paneles en lectura", permissions: ["Ver panel"] },
];
