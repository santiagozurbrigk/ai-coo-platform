import { InsightCard } from "@/components/intelligence";
import { mockInsights } from "@/mocks";

export default function IntelligenceInsightsPage() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {mockInsights.map((i) => (
        <InsightCard key={i.id} insight={i} />
      ))}
    </div>
  );
}
