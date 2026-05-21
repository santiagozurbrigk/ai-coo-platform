import { Badge, DataTable } from "@ai-coo/ui";
import { es } from "@/lib/locale/es";
import { formatRelativeTime } from "@/lib/format";
import type { TeamMember } from "@/types/team";
import { USER_ROLES } from "@/constants/roles";

const roleLabel = (role: TeamMember["role"]) =>
  USER_ROLES.find((r) => r.value === role)?.label ?? role;

const STATUS_LABEL = {
  active: es.status.member.active,
  away: es.status.member.away,
  inactive: es.status.member.inactive,
};

export function TeamMembersTable({ members }: { members: TeamMember[] }) {
  return (
    <DataTable
      title="Miembros"
      columns={[
        { key: "name", header: "Nombre", cell: (r) => r.name },
        { key: "email", header: "Email", cell: (r) => r.email },
        { key: "role", header: "Rol", cell: (r) => roleLabel(r.role) },
        {
          key: "status",
          header: "Estado",
          cell: (r) => (
            <Badge
              variant={r.status === "active" ? "success" : "secondary"}
            >
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
