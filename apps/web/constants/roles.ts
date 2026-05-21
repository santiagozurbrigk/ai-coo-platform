import type { UserRole } from "@ai-coo/types";

export const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: "founder", label: "Fundador" },
  { value: "admin", label: "Administrador" },
  { value: "project_manager", label: "Gestor de proyecto" },
  { value: "setter", label: "Setter" },
  { value: "operator", label: "Operador" },
  { value: "viewer", label: "Solo lectura" },
];
