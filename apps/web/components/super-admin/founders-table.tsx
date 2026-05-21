import { Badge, DataTable } from "@ai-coo/ui";
import { es } from "@/lib/locale/es";
import type { AdminFounder } from "@/types/super-admin";

const STATUS_LABEL = {
  active: es.status.org.active,
  trial: es.status.org.trial,
};

export function FoundersTable({ founders }: { founders: AdminFounder[] }) {
  return (
    <DataTable
      title="Fundadores"
      description="Cuentas principales por organización"
      columns={[
        { key: "name", header: "Nombre", cell: (r) => r.name },
        { key: "email", header: "Correo", cell: (r) => r.email },
        { key: "org", header: "Organización", cell: (r) => r.organization },
        { key: "mrr", header: "MRR", cell: (r) => r.mrr },
        {
          key: "status",
          header: "Estado",
          cell: (r) => (
            <Badge variant={r.status === "active" ? "success" : "warning"}>
              {STATUS_LABEL[r.status]}
            </Badge>
          ),
        },
      ]}
      data={founders}
      keyExtractor={(r) => r.id}
    />
  );
}
