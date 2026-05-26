import type { PermissionLevel } from "@/types/team";

export type PermissionModuleId =
  | "dashboard"
  | "finance"
  | "expenses"
  | "sales_inbox"
  | "sales_metrics"
  | "marketing"
  | "marketing_content"
  | "marketing_sales"
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
  { id: "finance", label: "Finanzas" },
  { id: "expenses", label: "Gastos" },
  { id: "sales_inbox", label: "Ventas → Bandeja", group: "Ventas" },
  { id: "sales_metrics", label: "Ventas → Métricas", group: "Ventas" },
  { id: "marketing", label: "Marketing → Overview" },
  { id: "marketing_content", label: "Marketing → Contenido" },
  { id: "marketing_sales", label: "Marketing → Conexión con Ventas" },
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
