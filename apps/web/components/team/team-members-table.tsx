"use client";

import { Badge, DataTable } from "@ai-coo/ui";
import { es } from "@/lib/locale/es";
import { formatRelativeTime } from "@/lib/format";
import type { CustomRole, TeamMember } from "@/types/team";
import { USER_ROLES } from "@/constants/roles";

const selectClass =
  "h-8 rounded-md border border-border bg-background px-2 text-xs";

const roleLabel = (role: TeamMember["role"]) =>
  USER_ROLES.find((r) => r.value === role)?.label ?? role;

const STATUS_LABEL = {
  active: es.status.member.active,
  away: es.status.member.away,
  inactive: es.status.member.inactive,
};

export function TeamMembersTable({
  members,
  customRoles,
}: {
  members: TeamMember[];
  customRoles: CustomRole[];
}) {
  return (
    <DataTable
      title="Miembros"
      columns={[
        { key: "name", header: "Nombre", cell: (r) => r.name },
        { key: "email", header: "Email", cell: (r) => r.email },
        {
          key: "role",
          header: "Rol asignado",
          cell: () => (
            <select className={selectClass} defaultValue="">
              <option value="">
                {customRoles.length === 0
                  ? "Sin roles creados aún"
                  : "Seleccionar rol…"}
              </option>
              {customRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          ),
        },
        {
          key: "systemRole",
          header: "Rol sistema",
          cell: (r) => roleLabel(r.role),
        },
        {
          key: "status",
          header: "Estado",
          cell: (r) => (
            <Badge variant={r.status === "active" ? "success" : "secondary"}>
              {STATUS_LABEL[r.status]}
            </Badge>
          ),
        },
        {
          key: "login",
          header: "Último acceso",
          cell: (r) => formatRelativeTime(r.lastLogin),
        },
      ]}
      data={members}
      keyExtractor={(r) => r.id}
    />
  );
}
