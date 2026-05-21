import { DataTable } from "@ai-coo/ui";
import { formatRelativeTime } from "@/lib/format";
import type { AdminTeamAccount } from "@/types/super-admin";

export function TeamAccountsTable({ accounts }: { accounts: AdminTeamAccount[] }) {
  return (
    <DataTable
      title="Cuentas de equipo"
      description="Usuarios provisionados en la plataforma"
      columns={[
        { key: "name", header: "Nombre", cell: (r) => r.name },
        { key: "email", header: "Correo", cell: (r) => r.email },
        { key: "org", header: "Organización", cell: (r) => r.organization },
        { key: "role", header: "Rol", cell: (r) => r.role },
        {
          key: "login",
          header: "Último acceso",
          cell: (r) => formatRelativeTime(r.lastLogin),
        },
      ]}
      data={accounts}
      keyExtractor={(r) => r.id}
    />
  );
}
