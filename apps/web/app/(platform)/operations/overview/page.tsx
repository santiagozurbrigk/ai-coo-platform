import { OperationsOverview } from "@/components/operations/operations-overview";
import { PageHeader } from "@/components/shared/page-header";

export default function OperationsOverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader description="Salud operativa y capacidad del equipo" />
      <OperationsOverview />
    </div>
  );
}
