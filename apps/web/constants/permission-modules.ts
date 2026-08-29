import type { PermissionLevel } from "@/types/team";

export type PermissionModuleId =
  | "dashboard"
  | "workboard"
  | "agent"
  | "finance"
  | "expenses"
  | "sales_inbox"
  | "sales_metrics"
  | "funnels"
  | "marketing"
  | "marketing_content"
  | "marketing_sales"
  | "marketing_forms"
  | "closing"
  | "clients"
  | "operations_overview"
  | "operations_sops"
  | "operations_team_inputs"
  | "knowledge_base"
  | "integrations"
  | "team"
  | "settings";

export const PERMISSION_MODULES: {
  id: PermissionModuleId;
  label: string;
  group?: string;
}[] = [
  { id: "dashboard", label: "Panel General" },
  { id: "workboard", label: "Tablero de trabajo" },
  { id: "agent", label: "Agente de negocio" },
  { id: "finance", label: "Finanzas" },
  { id: "expenses", label: "Gastos" },
  { id: "sales_inbox", label: "Ventas → Bandeja", group: "Ventas" },
  { id: "sales_metrics", label: "Ventas → Métricas", group: "Ventas" },
  { id: "funnels", label: "Embudos" },
  { id: "marketing", label: "Marketing → Overview" },
  { id: "marketing_content", label: "Marketing → Contenido" },
  { id: "marketing_sales", label: "Marketing → Conexión Ventas" },
  { id: "marketing_forms", label: "Marketing → Formularios" },
  { id: "closing", label: "Closing" },
  { id: "clients", label: "Clientes" },
  { id: "operations_overview", label: "Operaciones → Overview", group: "Operaciones" },
  { id: "operations_sops", label: "Operaciones → SOPs", group: "Operaciones" },
  { id: "operations_team_inputs", label: "Operaciones → Team Inputs", group: "Operaciones" },
  { id: "knowledge_base", label: "Base de conocimiento" },
  { id: "integrations", label: "Integraciones" },
  { id: "team", label: "Equipo" },
  { id: "settings", label: "Configuración" },
];

export const PERMISSION_LEVELS: { value: PermissionLevel; label: string }[] = [
  { value: "none", label: "Sin acceso" },
  { value: "view", label: "Solo lectura" },
  { value: "full", label: "Acceso total" },
];

export function emptyPermissions(): Record<PermissionModuleId, PermissionLevel> {
  return Object.fromEntries(
    PERMISSION_MODULES.map((m) => [m.id, "none" as PermissionLevel])
  ) as Record<PermissionModuleId, PermissionLevel>;
}

export const MODULE_GROUPS: {
  label: string;
  moduleIds: PermissionModuleId[];
}[] = [
  {
    label: "General",
    moduleIds: [
      "dashboard",
      "workboard",
      "agent",
      "clients",
      "knowledge_base",
    ],
  },
  {
    label: "Ventas",
    moduleIds: ["sales_inbox", "sales_metrics", "closing"],
  },
  {
    label: "Marketing",
    moduleIds: [
      "marketing",
      "marketing_content",
      "marketing_sales",
      "marketing_forms",
    ],
  },
  {
    label: "Operaciones",
    moduleIds: [
      "operations_overview",
      "operations_sops",
      "operations_team_inputs",
    ],
  },
  {
    label: "Finanzas y configuración",
    moduleIds: [
      "finance",
      "expenses",
      "integrations",
      "team",
      "settings",
    ],
  },
];

const MODULE_LABEL_BY_ID = Object.fromEntries(
  PERMISSION_MODULES.map((m) => [m.id, m.label])
) as Record<PermissionModuleId, string>;

export function getPermissionModuleLabel(id: PermissionModuleId): string {
  return MODULE_LABEL_BY_ID[id] ?? id;
}
