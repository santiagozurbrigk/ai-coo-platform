import { Badge, DataTable } from "@ai-coo/ui";
import { es } from "@/lib/locale/es";
import type { AdminOrganization } from "@/types/super-admin";

const ORG_STATUS: Record<string, string> = {
  active: es.status.org.active,
  trial: es.status.org.trial,
  churned: "Baja",
};

export function OrgTable({ organizations }: { organizations: AdminOrganization[] }) {
  return (
    <DataTable
      title="Organizaciones"
      columns={[
        { key: "name", header: "Organización", cell: (r) => r.name },
        { key: "founder", header: "Fundador", cell: (r) => r.founder },
        { key: "mrr", header: "MRR", cell: (r) => r.mrr },
        {
          key: "status",
          header: "Estado",
          cell: (r) => (
            <Badge variant={r.status === "active" ? "success" : "secondary"}>
              {ORG_STATUS[r.status]}
            </Badge>
          ),
        },
        { key: "ai", header: "Costo IA/mes", cell: (r) => r.aiCostMonth },
      ]}
      data={organizations}
      keyExtractor={(r) => r.id}
    />
  );
}
