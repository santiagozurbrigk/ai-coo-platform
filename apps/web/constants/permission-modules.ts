import type { PermissionLevel } from "@/types/team";

/**
 * ⭐ Los permisos se dan **por módulo**, no por pantalla.
 *
 * Antes había 21 filas y varias eran submódulos: "Ventas → Bandeja", "Ventas →
 * Métricas", "Closing". Nadie arma un rol que vea la bandeja pero no las
 * métricas; lo que se decide es si alguien entra a Ventas o no. Veintiún
 * interruptores para trece decisiones reales es una pantalla que se completa
 * mal.
 *
 * Las claves viejas siguen entendiéndose al leer un rol guardado —ver
 * `LEGACY_PERMISSION_MODULES`—, así que un rol creado antes de este cambio no
 * pierde accesos en silencio.
 */
export type PermissionModuleId =
  | "dashboard"
  | "workboard"
  | "agent"
  | "clients"
  | "knowledge_base"
  | "funnels"
  | "sales"
  | "marketing"
  | "operations"
  | "finance"
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
  { id: "clients", label: "Clientes" },
  { id: "knowledge_base", label: "Base de conocimiento" },
  { id: "funnels", label: "Embudos" },
  { id: "sales", label: "Ventas" },
  { id: "marketing", label: "Marketing" },
  { id: "operations", label: "Operaciones" },
  { id: "finance", label: "Finanzas" },
  { id: "integrations", label: "Integraciones" },
  { id: "team", label: "Equipo" },
  { id: "settings", label: "Configuración" },
];

/**
 * ⭐ Las claves de submódulo que existieron hasta el 2026-09-06.
 *
 * Un rol guardado con `marketing_content: "full"` se lee como `marketing:
 * "full"`. Sin esto, al consolidar los IDs esos permisos **se perderían en
 * silencio**: el mapeo descarta lo que no reconoce, y nadie vería un error.
 *
 * La migración de la base hace lo mismo de forma permanente; esto cubre el rato
 * entre el deploy y la migración, y cualquier fila que se haya quedado atrás.
 */
export const LEGACY_PERMISSION_MODULES: Record<string, PermissionModuleId> = {
  sales_inbox: "sales",
  sales_metrics: "sales",
  closing: "sales",
  marketing_content: "marketing",
  marketing_sales: "marketing",
  marketing_forms: "marketing",
  operations_overview: "operations",
  operations_sops: "operations",
  operations_team_inputs: "operations",
  expenses: "finance",
};

export const PERMISSION_LEVELS: { value: PermissionLevel; label: string }[] = [
  { value: "none", label: "Sin acceso" },
  { value: "view", label: "Solo lectura" },
  { value: "full", label: "Acceso total" },
];

/** Orden de los niveles, para poder quedarse con el más alto al consolidar. */
const LEVEL_RANK: Record<PermissionLevel, number> = { none: 0, view: 1, full: 2 };

/**
 * El mayor de dos niveles.
 *
 * ⭐ Al fusionar tres submódulos en uno, el resultado es el **más permisivo**:
 * alguien que tenía acceso total a Contenido no puede terminar con menos acceso
 * a Marketing del que ya tenía. Perder permisos en una migración es peor que
 * ganarlos, porque se descubre cuando alguien no puede trabajar.
 */
export function highestPermissionLevel(
  a: PermissionLevel,
  b: PermissionLevel
): PermissionLevel {
  return LEVEL_RANK[a] >= LEVEL_RANK[b] ? a : b;
}

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
      // Embudos va acá y no en "Ventas" porque atraviesa módulos: mide desde el
      // gasto en anuncios hasta el cobro. Agruparlo bajo Ventas sugeriría que
      // sólo cubre esa parte.
      "funnels",
      "workboard",
      "agent",
      "clients",
      "knowledge_base",
    ],
  },
  {
    label: "Operación",
    moduleIds: ["sales", "marketing", "operations"],
  },
  {
    label: "Finanzas y configuración",
    moduleIds: ["finance", "integrations", "team", "settings"],
  },
];

const MODULE_LABEL_BY_ID = Object.fromEntries(
  PERMISSION_MODULES.map((m) => [m.id, m.label])
) as Record<PermissionModuleId, string>;

export function getPermissionModuleLabel(id: PermissionModuleId): string {
  return MODULE_LABEL_BY_ID[id] ?? id;
}

/** Traduce una clave guardada —vieja o nueva— al módulo actual. */
export function resolvePermissionModuleId(key: string): PermissionModuleId | null {
  if (MODULE_LABEL_BY_ID[key as PermissionModuleId]) return key as PermissionModuleId;
  return LEGACY_PERMISSION_MODULES[key] ?? null;
}
