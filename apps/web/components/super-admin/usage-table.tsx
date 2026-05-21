import { DataTable } from "@ai-coo/ui";
import type { AdminUsageRow } from "@/types/super-admin";

export function UsageTable({ rows }: { rows: AdminUsageRow[] }) {
  return (
    <DataTable
      title="Uso de IA por organización"
      columns={[
        { key: "org", header: "Organización", cell: (r) => r.orgName },
        {
          key: "haiku",
          header: "Haiku",
          cell: (r) => r.haikuTokens.toLocaleString("es"),
        },
        {
          key: "sonnet",
          header: "Sonnet",
          cell: (r) => r.sonnetTokens.toLocaleString("es"),
        },
        { key: "opus", header: "Opus", cell: (r) => r.opusTokens.toLocaleString("es") },
        { key: "cost", header: "Total", cell: (r) => r.totalCost },
      ]}
      data={rows}
      keyExtractor={(r) => r.orgId}
    />
  );
}
