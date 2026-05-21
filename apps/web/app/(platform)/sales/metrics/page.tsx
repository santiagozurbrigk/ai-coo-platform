import { SalesMetricsOverview } from "@/components/sales";
import { mockSalesMetrics } from "@/mocks";

export default function SalesMetricsPage() {
  return <SalesMetricsOverview data={mockSalesMetrics} />;
}
